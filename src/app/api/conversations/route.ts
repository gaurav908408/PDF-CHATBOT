import { chatService } from "@/services/chat.service";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { API_ERROR_CODES } from "@/config/constants";
import { logger } from "@/lib/utils/logger";

export async function GET() {
  try {
    const conversations = await chatService.getConversations();
    return successResponse({ conversations, count: conversations.length });
  } catch (error) {
    logger.error("Get conversations route failed", error);
    return errorResponse(API_ERROR_CODES.INTERNAL_ERROR, "Failed to retrieve conversations list", 500);
  }
}
