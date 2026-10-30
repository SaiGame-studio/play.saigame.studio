"use client";

import { GameCoverArt } from "@/components/games/game-cover-art";
import { PlayedGameCard } from "@/components/games/played-game-card";
import { usePlayedGames } from "@/components/games/use-played-games";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Home: the player's game library as posters. */
export function PlayedGames() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { games, hasMore, isLoading, isLoadingMore, error, loadMore, retry } = usePlayedGames();
  const name = user?.display_name || user?.username || "";

  if (isLoading) {
    return (
      <div id="played-games-loading" role="status" aria-label={t("common.loading")} className="played-games-loading">
        <div id="played-games-loading-grid" className="played-games-loading-grid mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-12 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div id={`played-games-loading-card-${index}`} key={index} className="played-games-loading-card aspect-[3/4] animate-pulse rounded-md bg-card" />
          ))}
        </div>
      </div>
    );
  }

  if (error && games.length === 0) {
    return (
      <section id="played-games-error" className="played-games-error mx-auto w-full max-w-6xl px-4 py-16">
        <div id="played-games-error-body" className="played-games-error-body max-w-md space-y-4">
          <FormAlert id="played-games-error-alert" tone="error" message={t("games.loadFailed")} />
          <Button id="played-games-retry" variant="outline" size="sm" onClick={() => void retry()}>
            {t("games.retry")}
          </Button>
        </div>
      </section>
    );
  }

  if (games.length === 0) {
    return (
      <section id="played-games-empty" className="played-games-empty relative isolate flex min-h-[460px] flex-1 items-end overflow-hidden border-b border-border">
        <div id="played-games-empty-art" className="played-games-empty-art absolute inset-0 opacity-70">
          <GameCoverArt id="played-games-empty-art-image" seedKey="sai-play" cols={80} rows={34} />
        </div>
        <div id="played-games-empty-shade" aria-hidden className="played-games-empty-shade key-art-shade absolute inset-0" />
        <div id="played-games-empty-inner" className="played-games-empty-inner relative mx-auto w-full max-w-6xl px-4 pb-12">
          <h1 id="played-games-empty-title" className="played-games-empty-title font-display text-5xl font-extrabold uppercase leading-[0.9] sm:text-6xl">
            {t("games.emptyTitle")}
          </h1>
          <p id="played-games-empty-body" className="played-games-empty-body mt-4 max-w-md text-muted-foreground">
            {t("games.emptyBody")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <div id="played-games" className="played-games flex flex-1 flex-col">
      <section id="played-games-library" aria-labelledby="played-games-title" className="played-games-library mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:pt-16">
        <header id="played-games-header" className="played-games-header mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border pb-4">
          <h1 id="played-games-title" className="played-games-title font-display text-4xl font-extrabold uppercase leading-none sm:text-5xl">
            {t("games.title")}
          </h1>
          <p id="played-games-greeting" className="played-games-greeting text-sm text-muted-foreground">
            {t("home.greeting", { name })}
          </p>
        </header>

        <ul id="played-games-list" className="played-games-list grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {games.map((game) => (
            <PlayedGameCard key={game.game_id} game={game} />
          ))}
        </ul>

        {error && (
          <div id="played-games-more-error" className="played-games-more-error mt-6">
            <FormAlert id="played-games-more-error-alert" tone="error" message={t("games.loadFailed")} />
          </div>
        )}
        {hasMore && (
          <div id="played-games-more" className="played-games-more mt-10 flex justify-center">
            <Button id="played-games-load-more" variant="outline" onClick={() => void loadMore()} disabled={isLoadingMore}>
              {isLoadingMore ? t("common.loading") : t("games.loadMore")}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
