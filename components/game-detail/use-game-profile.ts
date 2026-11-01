"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api-client";
import { playerApi } from "@/lib/player-api";

/** Checks inventory access; request failures are reported separately from an absent profile. */
export function useGameProfile(gameId: string) {
  const { isAuthenticated } = useAuth();
  const [hasGameAccess, setHasGameAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(isAuthenticated);

  const [hasError, setHasError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setHasError(false);
    if (!isAuthenticated) {
      setHasGameAccess(false);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setHasGameAccess(false);
    setIsLoading(true);
    playerApi
      .getMyGamerProgress(gameId)
      .then((progress) => {
        if (!cancelled) setHasGameAccess(Boolean(progress?.id));
      })
      .catch((error) => {
        if (!cancelled) {
          setHasGameAccess(false);
          setHasError(!(error instanceof ApiError && error.code === "PLAYER_BANNED"));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gameId, isAuthenticated, attempt]);

  return { isLoading, hasGameAccess, hasError, retry: () => setAttempt((value) => value + 1) };
}
