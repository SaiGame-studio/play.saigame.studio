"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { playerApi, type PlayedGame, type PlayedGameScope } from "@/lib/player-api";

/** Loads the player's games of one scope with cursor-based "Load more" pagination; reloads on language change. */
export function usePlayedGames(scope: PlayedGameScope) {
  const { locale } = useTranslation();
  const version = useRef(0);
  const [games, setGames] = useState<PlayedGame[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFirstPage = useCallback(async () => {
    const request = ++version.current;
    setIsLoadingMore(false);
    setIsLoading(true);
    setError(null);
    try {
      const page = await playerApi.listMyGames(scope, locale);
      if (request !== version.current) return;
      setGames(page.games);
      setNextCursor(page.next_cursor);
    } catch (err) {
      if (request === version.current) setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (request === version.current) setIsLoading(false);
    }
  }, [scope, locale]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) {
      return;
    }
    const request = version.current;
    setIsLoadingMore(true);
    setError(null);
    try {
      const page = await playerApi.listMyGames(scope, locale, nextCursor);
      if (request !== version.current) return;
      setGames((current) => [...current, ...page.games]);
      setNextCursor(page.next_cursor);
    } catch (err) {
      if (request === version.current) setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (request === version.current) setIsLoadingMore(false);
    }
  }, [scope, locale, nextCursor, isLoadingMore]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  return { games, hasMore: nextCursor !== null, isLoading, isLoadingMore, error, loadMore, retry: loadFirstPage };
}
