import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export interface UserSession {
  userId: string;
  isGuest: boolean;
}

export const USER_SESSION_COOKIE = "pdf_rag_user_session";

export async function getCurrentUser(req?: NextRequest): Promise<UserSession> {
  // 1. Check header
  if (req) {
    const headerUserId = req.headers.get("x-user-id");
    if (headerUserId) {
      return { userId: headerUserId, isGuest: false };
    }
  }

  // 2. Check Cookie
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(USER_SESSION_COOKIE);
    if (sessionCookie && sessionCookie.value) {
      return { userId: sessionCookie.value, isGuest: true };
    }
  } catch {
    // Ignore cookie resolution error in static/non-request environments
  }

  // Fallback default guest workspace session ID
  return {
    userId: "guest-workspace-user-id",
    isGuest: true,
  };
}
