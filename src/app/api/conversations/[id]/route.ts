import { NextRequest } from "next/server";
import { chatService } from "@/services/chat.service";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { API_ERROR_CODES } from "@/config/constants";
import { logger } from "@/lib/utils/logger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const messages = await chatService.getConversationMessages(id);
    return successResponse({ conversationId: id, messages, count: messages.length });
  } catch (error) {
    logger.error("Get conversation messages route failed", error);
    return errorResponse(API_ERROR_CODES.INTERNAL_ERROR, "Failed to retrieve conversation messages", 500);
  }
}
