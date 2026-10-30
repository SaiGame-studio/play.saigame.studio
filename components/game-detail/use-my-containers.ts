"use client";

import { useCallback, useEffect, useState } from "react";
import { playerApi, type PlayerContainer } from "@/lib/player-api";

/** The player's item containers in one game with "Load more" (the existing endpoint pages by offset). */
export function useMyContainers(gameId: string) {
  const [containers, setContainers] = useState<PlayerContainer[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadFirstPage = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const page = await playerApi.listMyGameContainers(gameId);
      setContainers(page.containers ?? []);
      setHasMore(page.has_more);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true);
    setHasError(false);
    try {
      const page = await playerApi.listMyGameContainers(gameId, containers.length);
      setContainers((current) => [...current, ...(page.containers ?? [])]);
      setHasMore(page.has_more);
    } catch {
      setHasError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [gameId, containers.length]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  return { containers, hasMore, isLoading, isLoadingMore, hasError, loadMore, retry: loadFirstPage };
}
