"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { PLAYED_GAMES_MAX_PAGE_SIZE, playerApi, type PlayedGame, type PlayedGameScope } from "@/lib/player-api";

// Safety cap for the header switcher: 20 pages x 50 games per scope.
const MAX_PAGES = 20;
// Studio games first, then games played from other studios.
const SCOPES: PlayedGameScope[] = ["owned", "played"];

/** Loads every game the player has played (both scopes, all cursor pages) on first request, for the header switcher. */
export function useAllPlayedGames() {
  const { locale } = useTranslation();
  const [games, setGames] = useState<PlayedGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const loadedLocaleRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (loadedLocaleRef.current === locale) {
      return;
    }
    loadedLocaleRef.current = locale;
    setIsLoading(true);
    setHasError(false);
    try {
      const all: PlayedGame[] = [];
      for (const scope of SCOPES) {
        let cursor: string | null = null;
        for (let page = 0; page < MAX_PAGES; page += 1) {
          const result = await playerApi.listMyGames(scope, locale, cursor, PLAYED_GAMES_MAX_PAGE_SIZE);
          all.push(...result.games);
          cursor = result.next_cursor;
          if (!cursor) {
            break;
          }
        }
      }
      setGames(all);
    } catch {
      loadedLocaleRef.current = null;
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  return { games, isLoading, hasError, load };
}
