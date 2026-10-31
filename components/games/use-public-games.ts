"use client";

import { useCallback, useEffect, useState } from "react";
import { gameInfoApi, type PublicGame } from "@/lib/game-info-api";

/** Games studios have made public, with cursor-based "Load more". Works signed in or not. */
export function usePublicGames() {
  const [games, setGames] = useState<PublicGame[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadFirstPage = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const page = await gameInfoApi.listPublicGames();
      setGames(page.games ?? []);
      setNextCursor(page.next_cursor);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    setHasError(false);
    try {
      const page = await gameInfoApi.listPublicGames(nextCursor);
      setGames((current) => [...current, ...(page.games ?? [])]);
      setNextCursor(page.next_cursor);
    } catch {
      setHasError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  return { games, hasMore: nextCursor !== null, isLoading, isLoadingMore, hasError, loadMore, retry: loadFirstPage };
}
