"use client";

import { useCallback, useRef, useState } from "react";
import { PLAYED_GAMES_MAX_PAGE_SIZE, playerApi, type PlayedGame } from "@/lib/player-api";

// Safety cap for the header switcher: 20 pages x 50 games.
const MAX_PAGES = 20;

/** Loads every game the player has played (all cursor pages) on first request, for the header switcher. */
export function useAllPlayedGames() {
  const [games, setGames] = useState<PlayedGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const loadedRef = useRef(false);

  const load = useCallback(async () => {
    if (loadedRef.current) {
      return;
    }
    loadedRef.current = true;
    setIsLoading(true);
    setHasError(false);
    try {
      const all: PlayedGame[] = [];
      let cursor: string | null = null;
      for (let page = 0; page < MAX_PAGES; page += 1) {
        const result = await playerApi.listMyGames(cursor, PLAYED_GAMES_MAX_PAGE_SIZE);
        all.push(...result.games);
        cursor = result.next_cursor;
        if (!cursor) {
          break;
        }
      }
      setGames(all);
    } catch {
      loadedRef.current = false;
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { games, isLoading, hasError, load };
}
