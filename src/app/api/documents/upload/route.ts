import { NextRequest } from "next/server";
import { documentService } from "@/services/document.service";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { API_ERROR_CODES } from "@/config/constants";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse(API_ERROR_CODES.BAD_REQUEST, "No file uploaded. Please attach a PDF file.", 400);
    }

    const document = await documentService.uploadDocument(file);

    return successResponse(
      { document },
      "File uploaded successfully. Document processing queued.",
      201
    );
  } catch (error) {
    logger.error("Document upload route failed", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred during file upload.";
    return errorResponse(API_ERROR_CODES.INVALID_FILE, message, 400);
  }
}
