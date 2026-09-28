import { embeddingProvider } from "@/lib/ai/embeddings";
import { searchVectorDatabase, VectorSearchOptions } from "@/lib/vector/search";
import { rerankSearchResults } from "@/lib/vector/hybrid-search";
import { VectorSearchResult } from "@/types/rag";
import { logger } from "@/lib/utils/logger";

export class VectorSearchService {
  async search(question: string, options: VectorSearchOptions = {}): Promise<VectorSearchResult[]> {
    if (!question || !question.trim()) {
      throw new Error("Question input cannot be empty.");
    }

    const trimmedQuestion = question.trim();
    logger.info("Initiating hybrid vector & keyword retrieval for query", {
      question: trimmedQuestion.substring(0, 100),
      documentId: options.documentId,
    });

    // 1. Generate query embedding
    const queryEmbedding = await embeddingProvider.generateEmbedding(trimmedQuestion);

    // 2. Perform vector search in pgvector database
    const rawResults = await searchVectorDatabase(queryEmbedding, options);

    // 3. Apply hybrid keyword reranking
    const rerankedResults = rerankSearchResults(trimmedQuestion, rawResults);

    logger.info("Hybrid vector retrieval and reranking completed", {
      candidateCount: rawResults.length,
      topRerankedScore: rerankedResults.length > 0 ? rerankedResults[0].score : 0,
    });

    return rerankedResults;
  }
}

export const vectorSearchService = new VectorSearchService();
