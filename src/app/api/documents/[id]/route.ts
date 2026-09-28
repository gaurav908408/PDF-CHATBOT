import { NextRequest } from "next/server";
import { documentService } from "@/services/document.service";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { API_ERROR_CODES } from "@/config/constants";
import { logger } from "@/lib/utils/logger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const document = await documentService.getDocument(id);

    if (!document) {
      return errorResponse(API_ERROR_CODES.NOT_FOUND, `Document with ID ${id} was not found.`, 404);
    }

    return successResponse({ document });
  } catch (error) {
    logger.error("Get document by ID route failed", error);
    return errorResponse(API_ERROR_CODES.INTERNAL_ERROR, "Failed to retrieve document details", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await documentService.deleteDocument(id);

    if (!deleted) {
      return errorResponse(API_ERROR_CODES.NOT_FOUND, `Document with ID ${id} was not found or could not be deleted.`, 404);
    }

    return successResponse({ deleted: true }, "Document and associated file deleted successfully.");
  } catch (error) {
    logger.error("Delete document route failed", error);
    return errorResponse(API_ERROR_CODES.INTERNAL_ERROR, "Failed to delete document", 500);
  }
}
