import { documentService } from "@/services/document.service";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { API_ERROR_CODES } from "@/config/constants";
import { logger } from "@/lib/utils/logger";

export async function GET() {
  try {
    const documents = await documentService.getDocuments();
    return successResponse({ documents, count: documents.length });
  } catch (error) {
    logger.error("Get documents route failed", error);
    return errorResponse(API_ERROR_CODES.INTERNAL_ERROR, "Failed to retrieve documents list", 500);
  }
}
