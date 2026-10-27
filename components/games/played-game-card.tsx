"use client";

import { Ban, Clock, Sparkles } from "lucide-react";
import type { PlayedGame } from "@/lib/player-api";
import { useTranslation } from "@/lib/i18n/use-translation";

function formatDate(unixSeconds: number, locale: string) {
  return new Date(unixSeconds * 1000).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

export function PlayedGameCard({ game }: { game: PlayedGame }) {
  const { t, locale } = useTranslation();
  const id = `played-game-${game.game_id}`;

  return (
    <li
      id={id}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card/70 p-5 transition-colors hover:border-primary/50"
    >
      <div id={`${id}-glow`} aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100" />
      <div id={`${id}-header`} className="relative mb-4 flex items-start justify-between gap-3">
        <h3 id={`${id}-name`} className="font-display text-lg font-semibold leading-tight">
          {game.game_name}
        </h3>
        {game.is_banned && (
          <span id={`${id}-banned`} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            <Ban id={`${id}-banned-icon`} className="size-3" aria-hidden />
            {t("games.banned")}
          </span>
        )}
      </div>
      <dl id={`${id}-stats`} className="relative grid grid-cols-2 gap-3">
        <div id={`${id}-level`} className="rounded-lg bg-muted/60 px-3 py-2">
          <dt id={`${id}-level-label`} className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("games.level")}
          </dt>
          <dd id={`${id}-level-value`} className="font-display text-2xl font-bold text-primary">
            {game.level}
          </dd>
        </div>
        <div id={`${id}-experience`} className="rounded-lg bg-muted/60 px-3 py-2">
          <dt id={`${id}-experience-label`} className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
            <Sparkles id={`${id}-experience-icon`} className="size-3" aria-hidden />
            {t("games.experience")}
          </dt>
          <dd id={`${id}-experience-value`} className="font-display text-2xl font-bold">
            {game.experience.toLocaleString(locale)}
          </dd>
        </div>
      </dl>
      <p id={`${id}-last-played`} className="relative mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock id={`${id}-last-played-icon`} className="size-3.5" aria-hidden />
        {t("games.lastPlayed", { date: formatDate(game.last_played_at, locale) })}
      </p>
    </li>
  );
}
