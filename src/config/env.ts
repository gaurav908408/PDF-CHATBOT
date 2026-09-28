import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  AI_API_KEY: z.string().min(1, "AI_API_KEY is required"),
  EMBEDDING_API_KEY: z.string().min(1, "EMBEDDING_API_KEY is required"),
  AI_MODEL_NAME: z.string().default("gpt-4o-mini"),
  EMBEDDING_MODEL_NAME: z.string().default("text-embedding-3-small"),

  RAG_CHUNK_SIZE: z.coerce.number().int().positive().default(1000),
  RAG_CHUNK_OVERLAP: z.coerce.number().int().nonnegative().default(150),
  RAG_TOP_K: z.coerce.number().int().positive().default(5),
  RAG_SIMILARITY_THRESHOLD: z.coerce.number().min(0).max(1).default(0.70),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.flatten().fieldErrors);
    // Return fallback values for development/build time if missing
    return {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      NODE_ENV: (process.env.NODE_ENV as "development" | "test" | "production") || "development",
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/pdf_rag_db",
      AI_API_KEY: process.env.AI_API_KEY || "mock-ai-key",
      EMBEDDING_API_KEY: process.env.EMBEDDING_API_KEY || "mock-embedding-key",
      AI_MODEL_NAME: process.env.AI_MODEL_NAME || "gpt-4o-mini",
      EMBEDDING_MODEL_NAME: process.env.EMBEDDING_MODEL_NAME || "text-embedding-3-small",
      RAG_CHUNK_SIZE: Number(process.env.RAG_CHUNK_SIZE) || 1000,
      RAG_CHUNK_OVERLAP: Number(process.env.RAG_CHUNK_OVERLAP) || 150,
      RAG_TOP_K: Number(process.env.RAG_TOP_K) || 5,
      RAG_SIMILARITY_THRESHOLD: Number(process.env.RAG_SIMILARITY_THRESHOLD) || 0.70,
    };
  }

  return result.data;
}

export const env = validateEnv();
