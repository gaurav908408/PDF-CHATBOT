import { successResponse } from "@/lib/utils/api-response";
import { APP_CONFIG } from "@/config/constants";

export async function GET() {
  return successResponse(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: APP_CONFIG.name,
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    },
    "System health check operational"
  );
}
