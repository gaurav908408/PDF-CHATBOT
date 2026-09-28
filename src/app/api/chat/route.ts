import { NextRequest } from "next/server";
import { chatService } from "@/services/chat.service";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { sanitizeInputString } from "@/lib/security/sanitizer";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { API_ERROR_CODES } from "@/config/constants";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

const chatQuerySchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  conversationId: z.string().uuid().optional().or(z.literal("")),
  documentId: z.string().uuid().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  // Rate limiting check: 60 requests per minute
  const rateLimit = checkRateLimit(req, "chat_api", { limit: 60, windowMs: 60 * 1000 });
  if (!rateLimit.isAllowed) {
    return errorResponse(API_ERROR_CODES.BAD_REQUEST, "Rate limit exceeded. Please wait before asking more questions.", 429);
  }

  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    const validation = chatQuerySchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        API_ERROR_CODES.BAD_REQUEST,
        "Invalid chat request parameters",
        400,
        validation.error.flatten().fieldErrors
      );
    }

    const sanitizedQuestion = sanitizeInputString(validation.data.question);
    const { conversationId, documentId } = validation.data;

    const result = await chatService.handleUserQuestion(
      sanitizedQuestion,
      conversationId || undefined,
      documentId || undefined,
      user.userId
    );

    return successResponse(
      {
        conversationId: result.conversation.id,
        message: result.message,
      },
      "Answer generated successfully"
    );
  } catch (error) {
    logger.error("Chat API route execution failed", error);
    const msg = error instanceof Error ? error.message : "Failed to process chat question";
    return errorResponse(API_ERROR_CODES.INTERNAL_ERROR, msg, 500);
  }
}
