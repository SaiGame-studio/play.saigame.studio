import { requireApiUrl } from "@/lib/config";
import { clearSession, getAccessToken, refreshSession } from "@/lib/auth-session";

export class ApiError extends Error {
  status: number;
  code?: string;
  data: unknown;

  constructor(message: string, status: number, data?: unknown, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  requireAuth?: boolean;
}

interface ErrorBody {
  error?: string;
  message?: string;
  message_code?: string;
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

/**
 * Fetch wrapper for the ss-go API. Sends the in-memory bearer token and the shared
 * SSO cookie, refreshing the access token once on 401.
 */
export async function apiRequest<T = unknown>(endpoint: string, options: RequestOptions = {}, retried = false): Promise<T> {
  const { method = "GET", body, requireAuth = true } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (requireAuth) {
    const token = getAccessToken() ?? (await refreshSession());
    if (!token) {
      throw new ApiError("Authentication required", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${requireApiUrl()}${endpoint}`, {
      method,
      headers,
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : "Network error", 0, error);
  }

  if (response.status === 401 && requireAuth && !retried) {
    if (await refreshSession()) {
      return apiRequest<T>(endpoint, options, true);
    }
    clearSession();
  }

  const data = await parseBody(response);
  if (!response.ok) {
    const err = (typeof data === "object" && data !== null ? data : {}) as ErrorBody;
    throw new ApiError(err.error || err.message || `Request failed: ${response.status}`, response.status, data, err.message_code);
  }
  return data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(endpoint, { ...options, method: "POST", body }),
};
