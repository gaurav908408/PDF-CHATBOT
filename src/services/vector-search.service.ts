import { embeddingProvider } from "@/lib/ai/embeddings";
import { searchVectorDatabase, VectorSearchOptions } from "@/lib/vector/search";
import { VectorSearchResult } from "@/types/rag";
import { logger } from "@/lib/utils/logger";

export class VectorSearchService {
  async search(question: string, options: VectorSearchOptions = {}): Promise<VectorSearchResult[]> {
    if (!question || !question.trim()) {
      throw new Error("Question input cannot be empty.");
    }

    const trimmedQuestion = question.trim();
    logger.info("Initiating vector similarity retrieval for query", {
      question: trimmedQuestion.substring(0, 100),
      documentId: options.documentId,
    });

    // 1. Generate query embedding
    const queryEmbedding = await embeddingProvider.generateEmbedding(trimmedQuestion);

    // 2. Perform vector search in pgvector
    const results = await searchVectorDatabase(queryEmbedding, options);

    return results;
  }
}

export const vectorSearchService = new VectorSearchService();
