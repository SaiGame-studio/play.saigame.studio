"use client";

import { useEffect, useState } from "react";
import { playerApi } from "@/lib/player-api";

/**
 * Whether the player has a usable gamer profile in one game. Game APIs (inventory, shops) answer
 * 403 until the player has an unbanned profile, so callers check `hasGameAccess` before showing
 * those tabs. my-gamer-progress returns `{}` without a profile and 403 for a banned profile.
 */
export function useGameProfile(gameId: string) {
  const [hasGameAccess, setHasGameAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    playerApi
      .getMyGamerProgress(gameId)
      .then((progress) => {
        if (!cancelled) setHasGameAccess(Boolean(progress?.id));
      })
      .catch(() => {
        if (!cancelled) setHasGameAccess(false);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  return { isLoading, hasGameAccess };
}
