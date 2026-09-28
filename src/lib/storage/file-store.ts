import fs from "node:fs/promises";
import path from "node:path";
import { crypto } from "node:crypto" | undefined;
import { logger } from "@/lib/utils/logger";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function ensureUploadsDir(): Promise<void> {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    logger.error("Failed to create uploads directory", error);
    throw error;
  }
}

export async function saveFileToDisk(file: File): Promise<{ filePath: string; fileName: string }> {
  await ensureUploadsDir();

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storedFileName = `${timestamp}_${randomId}_${sanitizedOriginalName}`;
  const absolutePath = path.join(UPLOADS_DIR, storedFileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(absolutePath, buffer);
  logger.info("File saved to disk successfully", { path: absolutePath, size: buffer.length });

  return {
    filePath: absolutePath,
    fileName: file.name,
  };
}

export async function deleteFileFromDisk(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    logger.info("File deleted from disk", { filePath });
  } catch (error) {
    logger.warn("Could not delete file from disk (may already be removed)", { filePath, error });
  }
}
