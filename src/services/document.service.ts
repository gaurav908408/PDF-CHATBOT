import { validatePdfFile } from "@/lib/pdf/validator";
import { saveFileToDisk, deleteFileFromDisk } from "@/lib/storage/file-store";
import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument as deleteDocumentQuery,
} from "@/lib/db/queries";
import { Document } from "@/types/document";
import { logger } from "@/lib/utils/logger";

export class DocumentService {
  async uploadDocument(file: File, userId?: string): Promise<Document> {
    logger.info("Starting document upload pipeline", { fileName: file.name, fileSize: file.size });

    // 1. Validate File
    const validation = await validatePdfFile(file);
    if (!validation.isValid) {
      logger.warn("PDF file validation failed", { fileName: file.name, reason: validation.error });
      throw new Error(validation.error || "Invalid file format");
    }

    // 2. Save File to Storage
    const storageResult = await saveFileToDisk(file);

    // 3. Create Document Record in DB
    try {
      const document = await createDocument({
        fileName: storageResult.fileName,
        fileSize: file.size,
        filePath: storageResult.filePath,
        mimeType: file.type || "application/pdf",
        userId,
      });

      logger.info("Document record created in database", { documentId: document.id, status: document.status });
      return document;
    } catch (error) {
      logger.error("Failed to store document metadata in database", error);
      // Clean up saved file on disk if DB creation failed
      await deleteFileFromDisk(storageResult.filePath);
      throw new Error("Failed to save document metadata");
    }
  }

  async getDocuments(userId?: string): Promise<Document[]> {
    return getAllDocuments(userId);
  }

  async getDocument(id: string): Promise<Document | null> {
    return getDocumentById(id);
  }

  async deleteDocument(id: string): Promise<boolean> {
    logger.info("Initiating document deletion", { documentId: id });
    const doc = await getDocumentById(id);
    if (!doc) {
      return false;
    }

    // Remove file from disk
    if (doc.filePath) {
      await deleteFileFromDisk(doc.filePath);
    }

    // Delete record from DB
    return deleteDocumentQuery(id);
  }
}

export const documentService = new DocumentService();
