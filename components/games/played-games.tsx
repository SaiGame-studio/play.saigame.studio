"use client";

import { Gamepad2, Loader2 } from "lucide-react";
import { PlayedGameCard } from "@/components/games/played-game-card";
import { usePlayedGames } from "@/components/games/use-played-games";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/lib/i18n/use-translation";

export function PlayedGames() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { games, hasMore, isLoading, isLoadingMore, error, loadMore, retry } = usePlayedGames();
  const name = user?.display_name || user?.username || "";

  return (
    <section id="played-games" className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      <header id="played-games-header" className="mb-8">
        <p id="played-games-greeting" className="text-sm text-muted-foreground">
          {t("home.greeting", { name })}
        </p>
        <h1 id="played-games-title" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t("games.title")}
        </h1>
      </header>

      {isLoading ? (
        <div id="played-games-loading" className="flex items-center gap-3 py-16 text-muted-foreground">
          <Loader2 id="played-games-loading-icon" className="size-5 animate-spin text-primary" aria-hidden />
          <span id="played-games-loading-text">{t("common.loading")}</span>
        </div>
      ) : error && games.length === 0 ? (
        <div id="played-games-error" className="max-w-md space-y-3">
          <FormAlert id="played-games-error-alert" tone="error" message={t("games.loadFailed")} />
          <Button id="played-games-retry" variant="outline" size="sm" onClick={() => void retry()}>
            {t("games.retry")}
          </Button>
        </div>
      ) : games.length === 0 ? (
        <div id="played-games-empty" className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <Gamepad2 id="played-games-empty-icon" className="mb-4 size-10 text-muted-foreground" aria-hidden />
          <p id="played-games-empty-title" className="font-display text-lg font-semibold">
            {t("games.emptyTitle")}
          </p>
          <p id="played-games-empty-body" className="mt-1 text-sm text-muted-foreground">
            {t("games.emptyBody")}
          </p>
        </div>
      ) : (
        <>
          <ul id="played-games-list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <PlayedGameCard key={game.game_id} game={game} />
            ))}
          </ul>
          {error && <FormAlert id="played-games-more-error" tone="error" message={t("games.loadFailed")} />}
          {hasMore && (
            <div id="played-games-more" className="mt-8 flex justify-center">
              <Button id="played-games-load-more" variant="outline" onClick={() => void loadMore()} disabled={isLoadingMore}>
                {isLoadingMore ? t("common.loading") : t("games.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
