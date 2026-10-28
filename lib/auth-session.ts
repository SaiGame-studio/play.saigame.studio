import { CLIENT_ID, CLIENT_ID_HEADER, requireApiUrl } from "@/lib/config";

/**
 * Access token lives in memory only. The refresh token is an HttpOnly cookie on the
 * parent domain (.saigame.studio) issued by the API, shared with the Studio frontend,
 * so signing in on either site signs in both (SSO).
 */

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

type Listener = (token: string | null) => void;

// Refresh slightly before expiry to absorb latency and clock skew.
const REFRESH_SKEW_MS = 30_000;

let accessToken: string | null = null;
let expiresAt = 0;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let inflightRefresh: Promise<string | null> | null = null;
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
  accessToken = tokens.access_token;
  expiresAt =
    decodeExpiry(tokens.access_token) ??
    Date.now() + (tokens.expires_in ?? 900) * 1000;
  scheduleRefresh();
  notify();
}

export function clearSession() {
  accessToken = null;
  expiresAt = 0;
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  notify();
}

export function getAccessToken(): string | null {
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
 * Exchanges the shared SSO cookie for a fresh access token.
 * Returns null when there is no valid session; network errors keep the current state.
 */
export function refreshSession(): Promise<string | null> {
  if (inflightRefresh) {
    return inflightRefresh;
  }
  inflightRefresh = (async () => {
    try {
      const response = await fetch(`${requireApiUrl()}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json", [CLIENT_ID_HEADER]: CLIENT_ID },
      });
      if (!response.ok) {
        clearSession();
        return null;
      }
      const data = (await response.json()) as AuthTokens;
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
