import { searchVectorChunks } from "@/lib/db/queries";
import { VectorSearchResult } from "@/types/rag";
import { RAG_DEFAULTS } from "@/config/constants";
import { logger } from "@/lib/utils/logger";

export interface VectorSearchOptions {
  topK?: number;
  similarityThreshold?: number;
  documentId?: string;
}

export async function searchVectorDatabase(
  queryEmbedding: number[],
  options: VectorSearchOptions = {}
): Promise<VectorSearchResult[]> {
  const topK = options.topK || RAG_DEFAULTS.topK;
  const similarityThreshold = options.similarityThreshold ?? RAG_DEFAULTS.similarityThreshold;

  logger.info("Executing pgvector similarity search", {
    topK,
    similarityThreshold,
    documentId: options.documentId || "ALL_DOCUMENTS",
  });

  const start = Date.now();
  const results = await searchVectorChunks(queryEmbedding, topK, similarityThreshold, options.documentId);
  const duration = Date.now() - start;

  logger.info("pgvector similarity search completed", {
    resultsCount: results.length,
    durationMs: duration,
    topScore: results.length > 0 ? results[0].score : 0,
  });

  return results;
}
