import {
  createConversation,
  getConversationById,
  getAllConversations,
  createMessage,
  getMessagesByConversationId,
} from "@/lib/db/queries";
import { ragService } from "./rag.service";
import { Conversation, Message } from "@/types/chat";
import { logger } from "@/lib/utils/logger";

export class ChatService {
  async handleUserQuestion(
    question: string,
    conversationId?: string,
    documentId?: string,
    userId?: string
  ): Promise<{ conversation: Conversation; message: Message }> {
    logger.info("Processing user chat question", { question: question.substring(0, 100), conversationId, documentId });

    // 1. Get or create conversation session
    let conversation: Conversation | null = null;

    if (conversationId) {
      conversation = await getConversationById(conversationId);
    }

    if (!conversation) {
      const title = question.length > 30 ? question.substring(0, 30) + "..." : question;
      conversation = await createConversation(title, documentId, userId);
    }

    // 2. Save user message to database
    await createMessage({
      conversationId: conversation.id,
      role: "user",
      content: question,
    });

    // 3. Execute RAG Pipeline to generate grounded answer & citations
    const ragResult = await ragService.generateAnswer(question, { documentId });

    // 4. Save assistant response to database
    const assistantMessage = await createMessage({
      conversationId: conversation.id,
      role: "assistant",
      content: ragResult.answer,
      sources: ragResult.sources,
    });

    return {
      conversation,
      message: assistantMessage,
    };
  }

  async getConversations(userId?: string): Promise<Conversation[]> {
    return getAllConversations(userId);
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return getMessagesByConversationId(conversationId);
  }
}

export const chatService = new ChatService();
