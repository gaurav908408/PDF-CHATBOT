export type DocumentStatus = "UPLOADING" | "PROCESSING" | "READY" | "FAILED";

export interface Document {
  id: string;
  userId?: string;
  fileName: string;
  fileSize: number;
  filePath: string;
  mimeType: string;
  totalPages: number;
  status: DocumentStatus;
  errorMessage?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  pageNumber: number;
  content: string;
  tokenCount: number;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  createdAt?: Date | string;
}

export interface DocumentUploadResponse {
  document: Document;
}
