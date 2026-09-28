import { APP_CONFIG } from "@/config/constants";

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validatePdfFile(file: File): Promise<FileValidationResult> {
  if (!file) {
    return { isValid: false, error: "No file was provided." };
  }

  // 1. Validate extension
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".pdf")) {
    return { isValid: false, error: "Only PDF files are allowed (.pdf)." };
  }

  // 2. Validate MIME type
  if (file.type && !APP_CONFIG.allowedMimeTypes.includes(file.type)) {
    return { isValid: false, error: "Invalid file MIME type. Only application/pdf is allowed." };
  }

  // 3. Validate File Size
  if (file.size > APP_CONFIG.maxFileSizeBytes) {
    return {
      isValid: false,
      error: `File size exceeds the limit of ${APP_CONFIG.maxFileSizeMB}MB.`,
    };
  }

  if (file.size === 0) {
    return { isValid: false, error: "The uploaded file is empty (0 bytes)." };
  }

  // 4. Validate Magic Bytes (%PDF-)
  try {
    const arrayBuffer = await file.slice(0, 5).arrayBuffer();
    const header = new TextDecoder().decode(arrayBuffer);
    if (!header.startsWith("%PDF-")) {
      return { isValid: false, error: "Invalid PDF format. File magic header signature does not match PDF standards." };
    }
  } catch {
    return { isValid: false, error: "Failed to verify file integrity header." };
  }

  return { isValid: true };
}
