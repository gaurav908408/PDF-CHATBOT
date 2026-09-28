import { NextResponse } from "next/server";
import { ApiErrorResponse, ApiSuccessResponse, ApiErrorDetail } from "@/types/api";

export function successResponse<T>(data: T, message?: string, status = 200): NextResponse<ApiSuccessResponse<T>> {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    payload.message = message;
  }

  return NextResponse.json(payload, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const errorPayload: ApiErrorDetail = {
    code,
    message,
  };

  if (details !== undefined && details !== null) {
    errorPayload.details = details;
  }

  return NextResponse.json(
    {
      success: false,
      error: errorPayload,
    },
    { status }
  );
}
