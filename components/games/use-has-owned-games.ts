"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { playerApi } from "@/lib/player-api";

/**
 * Whether the player has any game in the "owned" scope (games I make); null while checking.
 * A failed check counts as true so the owned sub-tab stays reachable and shows its own error and retry.
 */
export function useHasOwnedGames() {
  const { locale } = useTranslation();
  const [hasOwnedGames, setHasOwnedGames] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    playerApi
      .listMyGames("owned", locale, null, 1)
      .then((page) => {
        if (!cancelled) setHasOwnedGames(page.games.length > 0);
      })
      .catch(() => {
        if (!cancelled) setHasOwnedGames(true);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return hasOwnedGames;
}
