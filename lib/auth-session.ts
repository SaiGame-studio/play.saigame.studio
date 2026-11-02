import { CLIENT_ID, CLIENT_ID_HEADER, requireApiUrl } from "@/lib/config";
import { writeStorage } from "@/lib/safe-storage";
import { allowSessionRefresh, hasSharedLoginSession, isSessionRefreshRejected, isSharedSessionCurrent, isSharedSessionSignedOut, rejectSessionRefresh } from "@/lib/shared-session";

/**
 * Access tokens live in memory. Both web apps restore the same account using the
 * shared HttpOnly refresh cookie; refresh tokens are never stored by JavaScript.
 */

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

type Listener = (token: string | null) => void;

const REFRESH_TOKEN_KEY = "refreshToken";

// Refresh slightly before expiry to absorb latency and clock skew.
const REFRESH_SKEW_MS = 30_000;

let accessToken: string | null = null;
let expiresAt = 0;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let inflightRefresh: Promise<string | null> | null = null;
let sessionVersion = 0;
const listeners = new Set<Listener>();

function decodeExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

function notify() {
  listeners.forEach((listener) => listener(accessToken));
}

function scheduleRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }
  if (!accessToken) {
    return;
  }
  const delay = Math.max(5_000, expiresAt - Date.now() - REFRESH_SKEW_MS);
  refreshTimer = setTimeout(() => {
    void refreshSession();
  }, delay);
}

export function setSession(tokens: AuthTokens) {
  allowSessionRefresh();
  sessionVersion++;
  accessToken = tokens.access_token;
  writeStorage(REFRESH_TOKEN_KEY, null);
  expiresAt =
    decodeExpiry(tokens.access_token) ??
    Date.now() + (tokens.expires_in ?? 900) * 1000;
  scheduleRefresh();
  notify();
}

export function clearSession() {
  sessionVersion++;
  accessToken = null;
  writeStorage(REFRESH_TOKEN_KEY, null);
  expiresAt = 0;
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  notify();
}

export function getAccessToken(): string | null {
  if (!isSharedSessionCurrent()) {
    clearSession();
    return null;
  }
  if (!accessToken || Date.now() >= expiresAt - REFRESH_SKEW_MS) {
    return null;
  }
  return accessToken;
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Exchanges the shared HttpOnly refresh cookie for this app's access token.
 * Network and server errors preserve the current session.
 */
export function refreshSession(): Promise<string | null> {
  if (!isSharedSessionCurrent() || isSharedSessionSignedOut()) {
    clearSession();
    return Promise.resolve(null);
  }
  if (!hasSharedLoginSession() || isSessionRefreshRejected()) return Promise.resolve(null);
  if (inflightRefresh) {
    return inflightRefresh;
  }
  const version = sessionVersion;
  inflightRefresh = (async () => {
    try {
      const response = await fetch(`${requireApiUrl()}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          [CLIENT_ID_HEADER]: CLIENT_ID,
        },
      });
      if (!isSharedSessionCurrent() || sessionVersion !== version) {
        return null;
      }
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          rejectSessionRefresh();
          clearSession();
        }
        return null;
      }
      const data = (await response.json()) as AuthTokens;
      if (!isSharedSessionCurrent() || sessionVersion !== version) {
        return null;
      }
      if (!data.access_token) {
        clearSession();
        return null;
      }
      setSession(data);
      return data.access_token;
    } catch (error) {
      console.warn("Session refresh skipped: network unavailable", error);
      return null;
    } finally {
      inflightRefresh = null;
    }
  })();
  return inflightRefresh;
}
