"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { gameInfoApi, type PublicGame } from "@/lib/game-info-api";

/** Games studios have made public, with cursor-based "Load more". Works signed in or not. */
export function usePublicGames() {
  const { locale } = useTranslation();
  const version = useRef(0);
  const [games, setGames] = useState<PublicGame[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadFirstPage = useCallback(async () => {
    const request = ++version.current;
    setGames([]);
    setNextCursor(null);
    setIsLoadingMore(false);
    setIsLoading(true);
    setHasError(false);
    try {
      const page = await gameInfoApi.listPublicGames(locale);
      if (request !== version.current) return;
      setGames(page.games ?? []);
      setNextCursor(page.next_cursor);
    } catch {
      if (request === version.current) setHasError(true);
    } finally {
      if (request === version.current) setIsLoading(false);
    }
  }, [locale]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    const request = version.current;
    setIsLoadingMore(true);
    setHasError(false);
    try {
      const page = await gameInfoApi.listPublicGames(locale, nextCursor);
      if (request !== version.current) return;
      setGames((current) => [...current, ...(page.games ?? [])]);
      setNextCursor(page.next_cursor);
    } catch {
      if (request === version.current) setHasError(true);
    } finally {
      if (request === version.current) setIsLoadingMore(false);
    }
  }, [nextCursor, locale, isLoadingMore]);

  useEffect(() => {
    void loadFirstPage();
    return () => { version.current++; };
  }, [loadFirstPage]);

  return { games, hasMore: nextCursor !== null, isLoading, isLoadingMore, hasError, loadMore, retry: loadFirstPage };
}
