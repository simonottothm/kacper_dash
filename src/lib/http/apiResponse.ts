import { NextResponse } from "next/server";

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: ApiError;
  requestId?: string;
}

export function ok<T>(data: T, requestId?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      ok: true,
      data,
      ...(requestId ? { requestId } : {}),
    },
    {
      headers: requestId ? { "x-request-id": requestId } : undefined,
    }
  );
}

export function badRequest(
  code: string,
  message: string,
  details?: unknown,
  requestId?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      ...(requestId ? { requestId } : {}),
    },
    {
      status: 400,
      headers: requestId ? { "x-request-id": requestId } : undefined,
    }
  );
}

export function unauthorized(
  message: string = "Not authenticated",
  requestId?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message,
      },
      ...(requestId ? { requestId } : {}),
    },
    {
      status: 401,
      headers: requestId ? { "x-request-id": requestId } : undefined,
    }
  );
}

export function forbidden(
  message: string = "Forbidden",
  requestId?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "FORBIDDEN",
        message,
      },
      ...(requestId ? { requestId } : {}),
    },
    {
      status: 403,
      headers: requestId ? { "x-request-id": requestId } : undefined,
    }
  );
}

export function notFound(
  message: string = "Not found",
  requestId?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message,
      },
      ...(requestId ? { requestId } : {}),
    },
    {
      status: 404,
      headers: requestId ? { "x-request-id": requestId } : undefined,
    }
  );
}

export function serverError(
  message: string,
  requestId?: string,
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message,
        ...(details ? { details } : {}),
      },
      ...(requestId ? { requestId } : {}),
    },
    {
      status: 500,
      headers: requestId ? { "x-request-id": requestId } : undefined,
    }
  );
}

export function tooManyRequests(
  message: string = "Rate limit exceeded",
  requestId?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message,
      },
      ...(requestId ? { requestId } : {}),
    },
    {
      status: 429,
      headers: requestId ? { "x-request-id": requestId } : undefined,
    }
  );
}

