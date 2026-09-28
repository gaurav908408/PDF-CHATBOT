import { Pool, QueryResult, QueryResultRow } from "pg";
import { env } from "@/config/env";
import { logger } from "@/lib/utils/logger";

declare global {
  // eslint-disable-next-line no-var
  var postgresPool: Pool | undefined;
}

// Global connection pool singleton for Next.js serverless/dev hot-reload optimization
export const pool =
  global.postgresPool ||
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  global.postgresPool = pool;
}

pool.on("error", (err) => {
  logger.error("Unexpected PostgreSQL client pool error", err);
});

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
    logger.error("Database Query Failed", error, { text: text.trim().substring(0, 100) });
    throw error;
  }
}

export async function getTransactionClient() {
  const client = await pool.connect();
  return client;
}
