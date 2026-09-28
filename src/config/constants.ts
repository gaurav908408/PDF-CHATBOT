export const APP_CONFIG = {
  name: "PDF RAG Assistant",
  description: "Enterprise PDF Retrieval-Augmented Generation Platform",
  maxFileSizeMB: 15,
  maxFileSizeBytes: 15 * 1024 * 1024,
  allowedMimeTypes: ["application/pdf"],
  allowedFileExtensions: [".pdf"],
};

export const RAG_DEFAULTS = {
  chunkSize: 1000,
  chunkOverlap: 150,
  topK: 5,
  similarityThreshold: 0.7,
  vectorDimension: 1536,
};

export const API_ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  INVALID_FILE: "INVALID_FILE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  PROCESSING_FAILED: "PROCESSING_FAILED",
  VECTOR_SEARCH_ERROR: "VECTOR_SEARCH_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
