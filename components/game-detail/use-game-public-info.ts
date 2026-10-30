"use client";

import { useCallback, useEffect, useState } from "react";
import { gameInfoApi, type GamePublicInfo } from "@/lib/game-info-api";

/** Loads the game's public info (name, image, release, promotional content). */
export function useGamePublicInfo(gameId: string) {
  const [info, setInfo] = useState<GamePublicInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      setInfo(await gameInfoApi.getPublicInfo(gameId));
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { info, isLoading, hasError, retry: load };
}
