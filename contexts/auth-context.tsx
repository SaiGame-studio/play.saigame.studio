"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authApi, type AuthResponse, type PlayUser } from "@/lib/auth-api";
import { clearSession, refreshSession, setSession, subscribeSession } from "@/lib/auth-session";
import { GUEST_ONLY_PATHS, getLoginUrl, getReturnToFromLocation, isPublicPath } from "@/lib/auth-redirect";
import { acceptSharedSession, getSharedSessionRevision, isSharedSessionCurrent, publishSharedSession, watchSharedSession } from "@/lib/shared-session";

interface AuthContextValue {
  user: PlayUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  completeLogin: (response: AuthResponse) => void;
  logout: () => Promise<void>;
  /** Signs out, then opens the login page, which returns to returnTo after signing in. */
  relogin: (returnTo: string) => Promise<void>;
  requireReauthentication: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlayUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresReauthentication, setRequiresReauthentication] = useState(false);
  const reauthenticationRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  const loadUser = useCallback(async () => {
    if (reauthenticationRef.current) return;
    const revision = getSharedSessionRevision();
    try {
      const { user: me } = await authApi.me();
      if (!reauthenticationRef.current && isSharedSessionCurrent() && revision === getSharedSessionRevision()) setUser(me);
    } catch {
      if (!reauthenticationRef.current && revision === getSharedSessionRevision()) setUser(null);
    }
  }, []);

  // Restore this app's access token from the shared SSO cookie.
  useEffect(() => {
    let cancelled = false;
    acceptSharedSession();
    (async () => {
      const token = await refreshSession();
      if (token && !cancelled) {
        await loadUser();
      }
      if (!cancelled) {
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadUser]);

  // Drop the user when the session ends (refresh failed or signed out elsewhere).
  useEffect(
    () =>
      subscribeSession((token) => {
        if (!token && !reauthenticationRef.current) {
          setUser(null);
        }
      }),
    [],
  );

  // Re-check the session when the tab regains focus.
  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState !== "visible" || reauthenticationRef.current) {
        return;
      }
      const token = await refreshSession();
      if (token) {
        await loadUser();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadUser]);

  const isAuthenticated = user !== null && !requiresReauthentication;

  const requireReauthentication = useCallback(() => {
    // Keep one-time recovery codes visible until the user has saved them.
    reauthenticationRef.current = true;
    setRequiresReauthentication(true);
    clearSession();
  }, []);

  useEffect(() => watchSharedSession(), []);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (requiresReauthentication && pathname === "/account") return;
    const isGuestOnly = GUEST_ONLY_PATHS.includes(pathname);
    if (!isAuthenticated && !isGuestOnly && !isPublicPath(pathname)) {
      router.replace(getLoginUrl(`${pathname}${window.location.search}`));
    } else if (isAuthenticated && isGuestOnly) {
      router.replace(getReturnToFromLocation());
    }
  }, [isAuthenticated, isLoading, pathname, router, requiresReauthentication]);

  const completeLogin = useCallback((response: AuthResponse) => {
    reauthenticationRef.current = false;
    setRequiresReauthentication(false);
    publishSharedSession();
    setSession(response);
    setUser(response.user);
  }, []);

  const signOut = useCallback(async (returnTo?: string) => {
    if (!isSharedSessionCurrent()) {
      reauthenticationRef.current = false;
      setRequiresReauthentication(false);
      clearSession();
      setUser(null);
      return;
    }
    publishSharedSession(false);
    try {
      if (!reauthenticationRef.current) await authApi.logout();
    } catch (error) {
      console.warn("Logout request failed; clearing local session anyway", error);
    }
    clearSession();
    reauthenticationRef.current = false;
    setRequiresReauthentication(false);
    setUser(null);
    router.replace(returnTo ? getLoginUrl(returnTo) : "/login");
  }, [router]);

  const logout = useCallback(() => signOut(), [signOut]);
  const relogin = useCallback((returnTo: string) => signOut(returnTo), [signOut]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, completeLogin, logout, relogin, requireReauthentication }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
