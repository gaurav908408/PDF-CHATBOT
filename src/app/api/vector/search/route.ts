import { NextRequest } from "next/server";
import { vectorSearchService } from "@/services/vector-search.service";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { API_ERROR_CODES } from "@/config/constants";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

const searchRequestSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  documentId: z.string().uuid().optional().or(z.literal("")),
  topK: z.number().int().positive().optional(),
  similarityThreshold: z.number().min(0).max(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = searchRequestSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        API_ERROR_CODES.BAD_REQUEST,
        "Invalid search request parameters",
        400,
        validation.error.flatten().fieldErrors
      );
    }

    const { question, documentId, topK, similarityThreshold } = validation.data;

    const results = await vectorSearchService.search(question, {
      documentId: documentId || undefined,
      topK,
      similarityThreshold,
    });

    return successResponse(
      {
        question,
        documentId: documentId || "ALL_DOCUMENTS",
        resultsCount: results.length,
        results,
      },
      `Vector search returned ${results.length} matching context chunks.`
    );
  } catch (error) {
    logger.error("Vector search API route failed", error);
    const msg = error instanceof Error ? error.message : "Vector search failed";
    return errorResponse(API_ERROR_CODES.VECTOR_SEARCH_ERROR, msg, 500);
  }
}
