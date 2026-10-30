"use client";

import { useCallback, useEffect, useState } from "react";
import { playerApi, type PlayerItem } from "@/lib/player-api";

const SEARCH_DEBOUNCE_MS = 300;

/** The player's items in one game with name search and cursor-based "Load more". */
export function useMyItems(gameId: string, search: string) {
  const [items, setItems] = useState<PlayerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [lastId, setLastId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [name, setName] = useState(search.trim());

  useEffect(() => {
    const timer = setTimeout(() => setName(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const loadFirstPage = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const page = await playerApi.listMyGameItems(gameId, { name });
      setItems(page.items ?? []);
      setTotal(page.total);
      setLastId(page.next_after ?? null);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [gameId, name]);

  const loadMore = useCallback(async () => {
    if (!lastId) return;
    setIsLoadingMore(true);
    setHasError(false);
    try {
      const page = await playerApi.listMyGameItems(gameId, { name, after: lastId });
      setItems((current) => [...current, ...(page.items ?? [])]);
      setLastId(page.next_after ?? null);
    } catch {
      setHasError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [gameId, name, lastId]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  return { items, total, hasMore: lastId !== null && items.length < total, isFiltered: name.length > 0, isLoading, isLoadingMore, hasError, loadMore, retry: loadFirstPage };
}
