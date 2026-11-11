"use client";

import { PlayedGameCard } from "@/components/games/played-game-card";
import { usePlayedGames } from "@/components/games/use-played-games";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { PlayedGameScope } from "@/lib/player-api";

const EMPTY_BODY_KEY: Record<PlayedGameScope, string> = {
  played: "games.emptyBody",
  owned: "games.ownedEmptyBody",
};

/**
 * One "My games" sub-tab: the player's games of `scope` as posters, with "Load more".
 * Ids use `{scope}-games-…`; cards use `{scope}-game-{gameId}`.
 */
export function PlayedGamesSection({ scope, labelledBy }: { scope: PlayedGameScope; labelledBy: string }) {
  const { t } = useTranslation();
  const { games, hasMore, isLoading, isLoadingMore, error, loadMore, retry } = usePlayedGames(scope);
  const base = `${scope}-games`;

  if (isLoading) {
    return (
      <div id={`${base}-loading`} role="status" aria-label={t("common.loading")} className={`${base}-loading`}>
        <div id={`${base}-loading-grid`} className={`${base}-loading-grid mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-12 sm:grid-cols-3 lg:grid-cols-4`}>
          {Array.from({ length: 4 }, (_, index) => (
            <div id={`${base}-loading-card-${index}`} key={index} className={`${base}-loading-card aspect-[3/4] animate-pulse rounded-md bg-card`} />
          ))}
        </div>
      </div>
    );
  }

  if (error && games.length === 0) {
    return (
      <section id={`${base}-error`} className={`${base}-error mx-auto w-full max-w-6xl px-4 py-16`}>
        <div id={`${base}-error-body`} className={`${base}-error-body max-w-md space-y-4`}>
          <FormAlert id={`${base}-error-alert`} tone="error" message={t("games.loadFailed")} />
          <Button id={`${base}-retry`} variant="outline" size="sm" onClick={() => void retry()}>
            {t("games.retry")}
          </Button>
        </div>
      </section>
    );
  }

  if (games.length === 0) {
    return (
      <section id={`${base}-empty`} className={`${base}-empty mx-auto w-full max-w-6xl px-4 py-12`}>
        <h2 id={`${base}-empty-title`} className={`${base}-empty-title font-display text-2xl font-bold uppercase`}>
          {t("games.emptyTitle")}
        </h2>
        <p id={`${base}-empty-body`} className={`${base}-empty-body mt-2 max-w-md text-sm text-muted-foreground`}>
          {t(EMPTY_BODY_KEY[scope])}
        </p>
      </section>
    );
  }

  return (
    <section id={`${base}-library`} aria-labelledby={labelledBy} className={`${base}-library mx-auto w-full max-w-6xl px-4 pb-20 pt-8`}>
      <ul id={`${base}-list`} className={`${base}-list grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4`}>
        {games.map((game) => (
          <PlayedGameCard key={game.game_id} game={game} base={`${scope}-game`} />
        ))}
      </ul>

      {error && (
        <div id={`${base}-more-error`} className={`${base}-more-error mt-6`}>
          <FormAlert id={`${base}-more-error-alert`} tone="error" message={t("games.loadFailed")} />
        </div>
      )}
      {hasMore && (
        <div id={`${base}-more`} className={`${base}-more mt-10 flex justify-center`}>
          <Button id={`${base}-load-more`} variant="outline" onClick={() => void loadMore()} disabled={isLoadingMore}>
            {isLoadingMore ? t("common.loading") : t("games.loadMore")}
          </Button>
        </div>
      )}
    </section>
  );
}
