"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { ApiError } from "@/lib/api-client";
import { GAME_NOT_PUBLIC, gameInfoApi, type GamePublicInfo } from "@/lib/game-info-api";

/** Loads the game's public info (name, image, release, promotional content). `isNotPublic` when the studio hides the game. */
export function useGamePublicInfo(gameId: string) {
  const { locale } = useTranslation();
  const version = useRef(0);
  const [info, setInfo] = useState<GamePublicInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isNotPublic, setIsNotPublic] = useState(false);

  const load = useCallback(async () => {
    const request = ++version.current;
    setInfo(null);
    setIsLoading(true);
    setHasError(false);
    setIsNotPublic(false);
    try {
      const info = await gameInfoApi.getPublicInfo(gameId, locale);
      if (request === version.current) setInfo(info);
    } catch (error) {
      if (request === version.current) {
        setIsNotPublic(error instanceof ApiError && error.code === GAME_NOT_PUBLIC);
        setHasError(true);
      }
    } finally {
      if (request === version.current) setIsLoading(false);
    }
  }, [gameId, locale]);

  useEffect(() => {
    void load();
    return () => { version.current++; };
  }, [load]);

  return { info, isLoading, hasError, isNotPublic, retry: load };
}
