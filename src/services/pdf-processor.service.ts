import fs from "node:fs/promises";
import { getDocumentById, updateDocumentStatus } from "@/lib/db/queries";
import { parsePdfPages } from "@/lib/pdf/parser";
import { generateTextChunks, GeneratedChunk } from "@/lib/pdf/chunker";
import { logger } from "@/lib/utils/logger";
import { RAG_DEFAULTS } from "@/config/constants";

export interface PdfProcessingResult {
  documentId: string;
  totalPages: number;
  totalChunks: number;
  chunks: GeneratedChunk[];
}

export class PdfProcessorService {
  async processDocument(
    documentId: string,
    options: { chunkSize?: number; chunkOverlap?: number } = {}
  ): Promise<PdfProcessingResult> {
    logger.info("Starting PDF text extraction and chunking processing", { documentId });

    const doc = await getDocumentById(documentId);
    if (!doc) {
      throw new Error(`Document with ID ${documentId} not found`);
    }

    try {
      // 1. Read file buffer
      const fileBuffer = await fs.readFile(doc.filePath);

      // 2. Parse PDF page-by-page
      const parseResult = await parsePdfPages(fileBuffer);

      if (parseResult.pages.length === 0 || parseResult.totalPages === 0) {
        throw new Error("No text content could be extracted from the PDF document.");
      }

      // 3. Generate text chunks
      const chunkSize = options.chunkSize || RAG_DEFAULTS.chunkSize;
      const chunkOverlap = options.chunkOverlap || RAG_DEFAULTS.chunkOverlap;

      const chunks = generateTextChunks(parseResult.pages, documentId, { chunkSize, chunkOverlap });

      if (chunks.length === 0) {
        throw new Error("Document text parsing produced 0 text chunks.");
      }

      // 4. Update document metadata in DB
      await updateDocumentStatus(documentId, "PROCESSING", parseResult.totalPages);

      logger.info("PDF processing completed successfully", {
        documentId,
        totalPages: parseResult.totalPages,
        totalChunks: chunks.length,
      });

      return {
        documentId,
        totalPages: parseResult.totalPages,
        totalChunks: chunks.length,
        chunks,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error during PDF parsing";
      logger.error("PDF Processing failed", error, { documentId });
      await updateDocumentStatus(documentId, "FAILED", 0, errorMsg);
      throw error;
    }
  }
}

export const pdfProcessorService = new PdfProcessorService();
