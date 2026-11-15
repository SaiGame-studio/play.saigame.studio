"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useSteamClaimedGames } from "@/components/auth/use-steam-claimed-games";
import { gameDetailHref } from "@/components/games/game-switcher";
import { GameThumb } from "@/components/games/game-thumb";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Games whose Claim Game items the player holds through the linked Steam account. */
export function SteamClaimedGames({ reloadKey }: { reloadKey: number }) {
  const { t, locale } = useTranslation();
  const { games, hasMore, isLoading, isLoadingMore, failed, loadMore } = useSteamClaimedGames(reloadKey);

  const formatDate = (seconds: number) =>
    new Date(seconds * 1000).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });

  return (
    <div id="steam-claimed-games" className="steam-claimed-games space-y-3 border-t border-border pt-4">
      <h3 id="steam-claimed-games-title" className="steam-claimed-games-title font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {t("steamLink.games.title")}
      </h3>
      {isLoading && (
        <p id="steam-claimed-games-loading" className="steam-claimed-games-loading flex items-center gap-2 text-muted-foreground">
          <Loader2 id="steam-claimed-games-loading-icon" className="steam-claimed-games-loading-icon size-4 animate-spin" aria-hidden />
          {t("steamLink.loading")}
        </p>
      )}
      {!isLoading && !failed && games.length === 0 && (
        <p id="steam-claimed-games-empty" className="steam-claimed-games-empty text-muted-foreground">
          {t("steamLink.games.empty")}
        </p>
      )}
      {games.length > 0 && (
        <ul id="steam-claimed-games-list" className="steam-claimed-games-list divide-y divide-border">
          {games.map((game) => (
            <li id={`steam-claimed-game-${game.game_id}`} key={game.game_id} className="steam-claimed-game">
              <Link
                id={`steam-claimed-game-${game.game_id}-link`}
                href={gameDetailHref(game.game_id)}
                className="steam-claimed-game-link flex items-center gap-3 py-3 hover:text-primary"
              >
                <GameThumb
                  id={`steam-claimed-game-${game.game_id}-thumb`}
                  gameId={game.game_id}
                  imageUrl={game.image_url}
                  className="steam-claimed-game-thumb size-10 shrink-0 rounded"
                  cols={10}
                  rows={10}
                />
                <span id={`steam-claimed-game-${game.game_id}-text`} className="steam-claimed-game-text min-w-0">
                  <span id={`steam-claimed-game-${game.game_id}-name`} className="steam-claimed-game-name block truncate font-medium">
                    {game.game_name}
                  </span>
                  <span id={`steam-claimed-game-${game.game_id}-claimed-at`} className="steam-claimed-game-claimed-at block text-xs text-muted-foreground">
                    {t("steamLink.games.claimedAt", { date: formatDate(game.claimed_at) })}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {failed && (
        <p id="steam-claimed-games-error" role="alert" className="steam-claimed-games-error text-destructive">
          {t("steamLink.games.failed")}
        </p>
      )}
      {hasMore && (
        <Button id="steam-claimed-games-load-more" className="steam-claimed-games-load-more" type="button" variant="outline" size="sm" disabled={isLoadingMore} onClick={() => void loadMore()}>
          {t("games.loadMore")}
        </Button>
      )}
    </div>
  );
}
