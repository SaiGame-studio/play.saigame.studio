"use client";

import { PlayedGameCard } from "@/components/games/played-game-card";
import { usePublicGames } from "@/components/games/use-public-games";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Home "Discover games" tab: games studios have made public on Sai Play, as posters. Shown to everyone. */
export function PublicGames() {
  const { t } = useTranslation();
  const { games, hasMore, isLoading, isLoadingMore, hasError, loadMore, retry } = usePublicGames();

  return (
    <section id="public-games" aria-labelledby="home-tab-discover" className="public-games mx-auto w-full max-w-6xl px-4 pb-20 pt-8">
      {isLoading ? (
        <div id="public-games-loading" role="status" aria-label={t("common.loading")} className="public-games-loading grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div id={`public-games-loading-card-${index}`} key={index} className="public-games-loading-card aspect-[3/4] animate-pulse rounded-md bg-card" />
          ))}
        </div>
      ) : hasError && games.length === 0 ? (
        <div id="public-games-error" className="public-games-error max-w-md space-y-4">
          <FormAlert id="public-games-error-alert" tone="error" message={t("publicGames.loadFailed")} />
          <Button id="public-games-retry" variant="outline" size="sm" onClick={() => void retry()}>
            {t("games.retry")}
          </Button>
        </div>
      ) : games.length === 0 ? (
        <p id="public-games-empty" className="public-games-empty rounded-md border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          {t("publicGames.empty")}
        </p>
      ) : (
        <>
          <ul id="public-games-list" className="public-games-list grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {games.map((game) => (
              <PlayedGameCard key={game.game_id} game={game} base="public-game" />
            ))}
          </ul>
          {hasError && (
            <div id="public-games-more-error" className="public-games-more-error mt-6">
              <FormAlert id="public-games-more-error-alert" tone="error" message={t("publicGames.loadFailed")} />
            </div>
          )}
          {hasMore && (
            <div id="public-games-more" className="public-games-more mt-10 flex justify-center">
              <Button id="public-games-load-more" variant="outline" onClick={() => void loadMore()} disabled={isLoadingMore}>
                {isLoadingMore ? t("common.loading") : t("games.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
