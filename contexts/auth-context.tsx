"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authApi, type AuthResponse, type PlayUser } from "@/lib/auth-api";
import { clearSession, refreshSession, setSession, subscribeSession } from "@/lib/auth-session";
import { GUEST_ONLY_PATHS, getLoginUrl, getReturnToFromLocation } from "@/lib/auth-redirect";

interface AuthContextValue {
  user: PlayUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  completeLogin: (response: AuthResponse) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlayUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadUser = useCallback(async () => {
    try {
      const { user: me } = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  // Restore the session on first load (no API call when no refresh token is stored).
  useEffect(() => {
    let cancelled = false;
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
        if (!token) {
          setUser(null);
        }
      }),
    [],
  );

  // Re-check the session when the tab regains focus.
  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      const token = await refreshSession();
      if (token && !user) {
        await loadUser();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [user, loadUser]);

  const isAuthenticated = user !== null;

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const isGuestOnly = GUEST_ONLY_PATHS.includes(pathname);
    if (!isAuthenticated && !isGuestOnly) {
      router.replace(getLoginUrl(`${pathname}${window.location.search}`));
    } else if (isAuthenticated && isGuestOnly) {
      router.replace(getReturnToFromLocation());
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const completeLogin = useCallback((response: AuthResponse) => {
    setSession(response);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn("Logout request failed; clearing local session anyway", error);
    }
    clearSession();
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, completeLogin, logout }}>
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
