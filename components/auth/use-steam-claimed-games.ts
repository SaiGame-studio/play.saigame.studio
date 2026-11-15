"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { steamLinkApi, type SteamClaimedGame } from "@/lib/steam-link-api";

/**
 * Loads the games claimed with the linked Steam account, with cursor-based "Load more" pagination.
 * Reloads when `reloadKey` or the language changes.
 */
export function useSteamClaimedGames(reloadKey: number) {
  const { locale } = useTranslation();
  const version = useRef(0);
  const [games, setGames] = useState<SteamClaimedGame[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);

  const loadFirstPage = useCallback(async () => {
    const request = ++version.current;
    setGames([]);
    setNextCursor(null);
    setIsLoadingMore(false);
    setFailed(false);
    setIsLoading(true);
    try {
      const page = await steamLinkApi.claimedGames(locale);
      if (request !== version.current) return;
      setGames(page.games);
      setNextCursor(page.next_cursor);
    } catch {
      if (request === version.current) setFailed(true);
    } finally {
      if (request === version.current) setIsLoading(false);
    }
  }, [locale]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    const request = version.current;
    setIsLoadingMore(true);
    setFailed(false);
    try {
      const page = await steamLinkApi.claimedGames(locale, nextCursor);
      if (request !== version.current) return;
      setGames((current) => [...current, ...page.games]);
      setNextCursor(page.next_cursor);
    } catch {
      if (request === version.current) setFailed(true);
    } finally {
      if (request === version.current) setIsLoadingMore(false);
    }
  }, [locale, nextCursor, isLoadingMore]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage, reloadKey]);

  return { games, hasMore: nextCursor !== null, isLoading, isLoadingMore, failed, loadMore };
}
