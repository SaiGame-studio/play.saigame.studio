"use client";

import { Ban } from "lucide-react";
import { GameCoverArt } from "@/components/games/game-cover-art";
import type { PlayedGame } from "@/lib/player-api";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

function formatDate(unixSeconds: number, locale: string) {
  return new Date(unixSeconds * 1000).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

/** Poster card for one played game: key art, title, level, XP and last played date. */
export function PlayedGameCard({ game }: { game: PlayedGame }) {
  const { t, locale } = useTranslation();
  const id = `played-game-${game.game_id}`;

  return (
    <li id={id} className="played-game">
      <article
        id={`${id}-poster`}
        className="played-game-poster relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-md border border-border bg-card"
      >
        <div id={`${id}-art`} className={cn("played-game-art absolute inset-0", game.is_banned && "opacity-50 grayscale")}>
          <GameCoverArt id={`${id}-art-image`} seedKey={game.game_id} cols={15} rows={20} />
        </div>
        <div id={`${id}-shade`} aria-hidden className="played-game-shade key-art-shade absolute inset-0" />

        {game.is_banned && (
          <span
            id={`${id}-banned`}
            className="played-game-banned absolute left-3 top-3 inline-flex items-center gap-1 rounded-sm bg-destructive px-1.5 py-0.5 font-display text-xs font-semibold uppercase tracking-wide text-background"
          >
            <Ban id={`${id}-banned-icon`} className="played-game-banned-icon size-3" aria-hidden />
            {t("games.banned")}
          </span>
        )}

        <div id={`${id}-body`} className="played-game-body relative p-4">
          <h3 id={`${id}-name`} className="played-game-name line-clamp-2 text-balance font-display text-2xl font-bold uppercase leading-[0.95]">
            {game.game_name}
          </h3>
          <dl id={`${id}-stats`} className="played-game-stats mt-3 flex items-end gap-4">
            <div id={`${id}-level`} className="played-game-level flex flex-col-reverse">
              <dt id={`${id}-level-label`} className="played-game-level-label text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {t("games.level")}
              </dt>
              <dd id={`${id}-level-value`} className="played-game-level-value tabular font-display text-2xl font-bold leading-none text-accent">
                {game.level.toLocaleString(locale)}
              </dd>
            </div>
            <div id={`${id}-experience`} className="played-game-experience flex min-w-0 flex-col-reverse">
              <dt id={`${id}-experience-label`} className="played-game-experience-label text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {t("games.experience")}
              </dt>
              <dd id={`${id}-experience-value`} className="played-game-experience-value tabular truncate font-display text-2xl font-bold leading-none">
                {game.experience.toLocaleString(locale)}
              </dd>
            </div>
          </dl>
          <p id={`${id}-last-played`} className="played-game-last-played mt-3 border-t border-foreground/15 pt-2.5 text-xs text-muted-foreground">
            {t("games.lastPlayed", { date: formatDate(game.last_played_at, locale) })}
          </p>
        </div>
      </article>
    </li>
  );
}
