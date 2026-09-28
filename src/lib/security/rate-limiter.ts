import { NextRequest } from "next/server";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

export interface RateLimitConfig {
  limit: number; // Max allowed requests
  windowMs: number; // Window size in milliseconds
}

export function checkRateLimit(
  req: NextRequest,
  keyPrefix: string,
  config: RateLimitConfig = { limit: 30, windowMs: 60 * 1000 }
): { isAllowed: boolean; remaining: number; resetMs: number } {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  const record = store.get(key);

  if (!record || now > record.resetTime) {
    store.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { isAllowed: true, remaining: config.limit - 1, resetMs: config.windowMs };
  }

  if (record.count >= config.limit) {
    return { isAllowed: false, remaining: 0, resetMs: record.resetTime - now };
  }

  record.count += 1;
  return { isAllowed: true, remaining: config.limit - record.count, resetMs: record.resetTime - now };
}
