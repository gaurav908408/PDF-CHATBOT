import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export interface UserSession {
  userId: string;
  isGuest: boolean;
}

export const USER_SESSION_COOKIE = "pdf_rag_user_session";
// Valid RFC4122 UUID for guest workspace session
export const GUEST_USER_UUID = "a0000000-0000-0000-0000-000000000001";

export async function getCurrentUser(req?: NextRequest): Promise<UserSession> {
  // 1. Check header
  if (req) {
    const headerUserId = req.headers.get("x-user-id");
    if (headerUserId && isValidUuid(headerUserId)) {
      return { userId: headerUserId, isGuest: false };
    }
  }

  // 2. Check Cookie
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(USER_SESSION_COOKIE);
    if (sessionCookie && sessionCookie.value && isValidUuid(sessionCookie.value)) {
      return { userId: sessionCookie.value, isGuest: true };
    }
  } catch {
    // Ignore cookie resolution error in static/non-request environments
  }

  // Fallback default valid UUID guest workspace session ID
  return {
    userId: GUEST_USER_UUID,
    isGuest: true,
  };
}

function isValidUuid(uuidStr: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuidStr);
}
