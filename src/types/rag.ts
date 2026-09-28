import { DocumentChunk } from "./document";
import { SourceCitation } from "./chat";

export interface VectorSearchResult {
  chunk: DocumentChunk;
  score: number;
}

export interface RagContext {
  chunks: DocumentChunk[];
  formattedContext: string;
  sources: SourceCitation[];
}

export interface RagResponse {
  answer: string;
  sources: SourceCitation[];
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChunkingOptions {
  chunkSize: number;
  chunkOverlap: number;
}
