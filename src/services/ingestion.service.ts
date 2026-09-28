import { pdfProcessorService } from "./pdf-processor.service";
import { embeddingProvider } from "@/lib/ai/embeddings";
import { vectorStoreService, ChunkWithEmbedding } from "@/lib/vector/store";
import { updateDocumentStatus } from "@/lib/db/queries";
import { logger } from "@/lib/utils/logger";

export interface IngestionResult {
  documentId: string;
  totalPages: number;
  totalChunks: number;
  status: "READY" | "FAILED";
}

export class IngestionService {
  async processAndIndexDocument(documentId: string): Promise<IngestionResult> {
    logger.info("Starting end-to-end PDF processing and pgvector indexing pipeline", { documentId });

    try {
      // Step 1: Parse PDF & Generate Text Chunks
      const pdfResult = await pdfProcessorService.processDocument(documentId);
      const rawChunks = pdfResult.chunks;

      logger.info("Step 1 Complete: Text extracted and chunked", {
        documentId,
        totalPages: pdfResult.totalPages,
        totalChunks: rawChunks.length,
      });

      // Step 2: Generate Vector Embeddings for Chunks
      const chunkTexts = rawChunks.map((c) => c.content);
      const embeddings = await embeddingProvider.generateBatchEmbeddings(chunkTexts);

      if (embeddings.length !== rawChunks.length) {
        throw new Error(`Embedding count mismatch: generated ${embeddings.length} embeddings for ${rawChunks.length} chunks`);
      }

      const chunksWithEmbeddings: ChunkWithEmbedding[] = rawChunks.map((chunk, idx) => ({
        ...chunk,
        embedding: embeddings[idx],
      }));

      logger.info("Step 2 Complete: Embeddings generated", { documentId, count: embeddings.length });

      // Step 3: Persist Chunks and Vectors into pgvector
      await vectorStoreService.storeChunks(chunksWithEmbeddings);

      logger.info("Step 3 Complete: Vectors stored in pgvector database", { documentId });

      // Step 4: Update Document Status to READY with verified totalPages
      await updateDocumentStatus(documentId, "READY", pdfResult.totalPages);

      logger.info("End-to-End Ingestion Pipeline Finished Successfully", { documentId, totalPages: pdfResult.totalPages, status: "READY" });

      return {
        documentId,
        totalPages: pdfResult.totalPages,
        totalChunks: rawChunks.length,
        status: "READY",
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Ingestion pipeline failure";
      logger.error("End-to-End Ingestion Pipeline Failed", error, { documentId });
      await updateDocumentStatus(documentId, "FAILED", undefined, errorMsg);
      throw error;
    }
  }
}

export const ingestionService = new IngestionService();
