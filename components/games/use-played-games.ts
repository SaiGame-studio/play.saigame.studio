"use client";

import { useCallback, useEffect, useState } from "react";
import { playerApi, type PlayedGame } from "@/lib/player-api";

/** Loads the player's games with cursor-based "Load more" pagination. */
export function usePlayedGames() {
  const [games, setGames] = useState<PlayedGame[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFirstPage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const page = await playerApi.listMyGames();
      setGames(page.games);
      setNextCursor(page.next_cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor) {
      return;
    }
    setIsLoadingMore(true);
    setError(null);
    try {
      const page = await playerApi.listMyGames(nextCursor);
      setGames((current) => [...current, ...page.games]);
      setNextCursor(page.next_cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  return { games, hasMore: nextCursor !== null, isLoading, isLoadingMore, error, loadMore, retry: loadFirstPage };
}
