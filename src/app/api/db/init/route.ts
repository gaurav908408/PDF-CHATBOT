import { query } from "@/lib/db/client";
import { MIGRATION_SQL } from "@/lib/db/schema";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

export async function POST() {
  try {
    logger.info("Executing database initialization migration script...");
    await query(MIGRATION_SQL);
    logger.info("Database schema and pgvector indexes initialized successfully");
    
    return successResponse(
      { initialized: true, timestamp: new Date().toISOString() },
      "Database schema and pgvector extension initialized successfully"
    );
  } catch (error) {
    logger.error("Database initialization migration failed", error);
    return errorResponse("DB_MIGRATION_FAILED", "Failed to initialize database schema", 500, error);
  }
}
