import { NextRequest } from "next/server";
import { ingestionService } from "@/services/ingestion.service";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { API_ERROR_CODES } from "@/config/constants";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    logger.info("Manual document indexing trigger requested", { documentId: id });

    const result = await ingestionService.processAndIndexDocument(id);

    return successResponse(
      { result },
      "Document processing, embedding generation, and vector indexing completed successfully."
    );
  } catch (error) {
    logger.error("Manual document indexing route failed", error);
    const msg = error instanceof Error ? error.message : "Document indexing pipeline failed";
    return errorResponse(API_ERROR_CODES.INTERNAL_ERROR, msg, 500);
  }
}
