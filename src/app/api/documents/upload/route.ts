import { NextRequest } from "next/server";
import { documentService } from "@/services/document.service";
import { ingestionService } from "@/services/ingestion.service";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { API_ERROR_CODES } from "@/config/constants";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest) {
  // Rate limiting check: 20 uploads per minute
  const rateLimit = checkRateLimit(req, "upload_api", { limit: 20, windowMs: 60 * 1000 });
  if (!rateLimit.isAllowed) {
    return errorResponse(API_ERROR_CODES.BAD_REQUEST, "Upload rate limit exceeded. Please wait before uploading more files.", 429);
  }

  try {
    const user = await getCurrentUser(req);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse(API_ERROR_CODES.BAD_REQUEST, "No file uploaded. Please attach a PDF file.", 400);
    }

    // 1. Upload & Create DB Record
    const document = await documentService.uploadDocument(file, user.userId);

    // 2. Trigger Ingestion Pipeline (PDF Parse -> Chunking -> Embeddings -> pgvector)
    ingestionService.processAndIndexDocument(document.id).catch((err) => {
      logger.error("Background ingestion pipeline failed for document", err, { documentId: document.id });
    });

    return successResponse(
      { document },
      "File uploaded successfully. Text extraction, chunking, and embedding ingestion started.",
      201
    );
  } catch (error) {
    logger.error("Document upload route failed", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred during file upload.";
    return errorResponse(API_ERROR_CODES.INVALID_FILE, message, 400);
  }
}
