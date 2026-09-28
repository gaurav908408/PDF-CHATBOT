import { NextRequest } from "next/server";
import { pdfProcessorService } from "@/services/pdf-processor.service";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { API_ERROR_CODES } from "@/config/constants";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const result = await pdfProcessorService.processDocument(id, {
      chunkSize: body.chunkSize,
      chunkOverlap: body.chunkOverlap,
    });

    return successResponse(
      {
        documentId: result.documentId,
        totalPages: result.totalPages,
        totalChunks: result.totalChunks,
        sampleChunk: result.chunks[0] || null,
      },
      "PDF text extracted and chunks generated successfully."
    );
  } catch (error) {
    logger.error("PDF processing API route failed", error);
    const msg = error instanceof Error ? error.message : "PDF extraction failed";
    return errorResponse(API_ERROR_CODES.PROCESSING_FAILED, msg, 400);
  }
}
