import { Pool, QueryResult, QueryResultRow } from "pg";
import { env } from "@/config/env";
import { MIGRATION_SQL } from "@/lib/db/schema";
import { logger } from "@/lib/utils/logger";

declare global {
  // eslint-disable-next-line no-var
  var postgresPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var isDbInitialized: boolean | undefined;
}

const isCloudDatabase = env.DATABASE_URL.includes("sslmode=require") || env.DATABASE_URL.includes("neon.tech");

// Global connection pool singleton for Next.js serverless/dev hot-reload optimization
export const pool =
  global.postgresPool ||
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ...(isCloudDatabase && {
      ssl: {
        rejectUnauthorized: false,
      },
    }),
  });

if (process.env.NODE_ENV !== "production") {
  global.postgresPool = pool;
}

pool.on("error", (err) => {
  logger.error("Unexpected PostgreSQL client pool error", err);
});

async function autoInitializeTables(): Promise<void> {
  if (global.isDbInitialized) return;
  try {
    logger.info("Auto-initializing database schema and pgvector extension on Neon Cloud DB...");
    await pool.query(MIGRATION_SQL);
    global.isDbInitialized = true;
    logger.info("Database auto-initialization completed successfully");
  } catch (err) {
    logger.error("Failed auto-initializing database tables", err);
  }
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug("Database Query Executed", { text: text.trim().substring(0, 100), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    const errObj = error as { code?: string; message?: string };
    
    // Catch relation "documents" does not exist (code 42P01) and auto-migrate
    if (errObj.code === "42P01" || (errObj.message && errObj.message.includes("does not exist"))) {
      logger.warn("Missing database tables detected. Triggering automatic database table migration...");
      await autoInitializeTables();
      // Retry original query after auto migration
      return await pool.query<T>(text, params);
    }

    logger.error("Database Query Failed", error, { text: text.trim().substring(0, 100) });
    throw error;
  }
}

export async function getTransactionClient() {
  const client = await pool.connect();
  return client;
}
