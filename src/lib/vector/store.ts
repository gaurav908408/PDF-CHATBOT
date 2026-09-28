import { insertDocumentChunk } from "@/lib/db/queries";
import { GeneratedChunk } from "@/lib/pdf/chunker";
import { logger } from "@/lib/utils/logger";

export interface ChunkWithEmbedding extends GeneratedChunk {
  embedding: number[];
}

export class VectorStoreService {
  async storeChunks(chunks: ChunkWithEmbedding[]): Promise<number> {
    if (!chunks || chunks.length === 0) {
      return 0;
    }

    const documentId = chunks[0].documentId;
    logger.info("Persisting text chunks and vector embeddings into pgvector store", {
      documentId,
      totalChunks: chunks.length,
    });

    let storedCount = 0;

    for (const chunk of chunks) {
      try {
        await insertDocumentChunk({
          documentId: chunk.documentId,
          chunkIndex: chunk.chunkIndex,
          pageNumber: chunk.pageNumber,
          content: chunk.content,
          tokenCount: chunk.tokenCount,
          embedding: chunk.embedding,
          metadata: chunk.metadata,
        });
        storedCount++;
      } catch (error) {
        logger.error("Failed to insert chunk into pgvector database", error, {
          documentId: chunk.documentId,
          chunkIndex: chunk.chunkIndex,
        });
        throw error;
      }
    }

    logger.info("Successfully stored all chunks and embeddings in pgvector", { documentId, storedCount });
    return storedCount;
  }
}

export const vectorStoreService = new VectorStoreService();
