export type MessageRole = "user" | "assistant" | "system";

export interface SourceCitation {
  documentId: string;
  documentName?: string;
  pageNumber: number;
  chunkId?: string;
  snippet: string;
  similarityScore?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  sources?: SourceCitation[];
  createdAt: Date | string;
}

export interface Conversation {
  id: string;
  userId?: string;
  documentId?: string;
  title: string;
  messages?: Message[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ChatQueryRequest {
  conversationId?: string;
  documentId?: string;
  question: string;
}

export interface ChatQueryResponse {
  conversationId: string;
  message: Message;
}
