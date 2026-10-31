"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { GAME_NOT_PUBLIC, gameInfoApi, type GamePublicInfo } from "@/lib/game-info-api";

/** Loads the game's public info (name, image, release, promotional content). `isNotPublic` when the studio hides the game. */
export function useGamePublicInfo(gameId: string) {
  const [info, setInfo] = useState<GamePublicInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isNotPublic, setIsNotPublic] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    setIsNotPublic(false);
    try {
      setInfo(await gameInfoApi.getPublicInfo(gameId));
    } catch (error) {
      setIsNotPublic(error instanceof ApiError && error.code === GAME_NOT_PUBLIC);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { info, isLoading, hasError, isNotPublic, retry: load };
}
