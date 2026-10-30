"use client";

import Link from "next/link";
import { Ban } from "lucide-react";
import type { CSSProperties } from "react";
import { GameCoverArt } from "@/components/games/game-cover-art";
import { HERO_INTERVAL_MS, useHeroRotation } from "@/components/games/use-hero-rotation";
import { SgemIcon } from "@/components/sgem/sgem-icon";
import { buttonVariants } from "@/components/ui/button";
import type { PlayedGame } from "@/lib/player-api";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

function formatDate(unixSeconds: number, locale: string) {
  return new Date(unixSeconds * 1000).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

/** Full-bleed key-art banner rotating through the player's most recently played games. */
export function GamesHero({ games }: { games: PlayedGame[] }) {
  const { t, locale } = useTranslation();
  const { active, cycle, isRunning, select, setIsPaused } = useHeroRotation(games.length);
  const game = games[active];
  const progressStyle = { "--hero-interval": `${HERO_INTERVAL_MS}ms` } as CSSProperties;

  if (!game) return null;

  const stats = [
    { key: "level", label: t("games.level"), value: game.level.toLocaleString(locale), tone: "text-accent" },
    { key: "experience", label: t("games.experience"), value: game.experience.toLocaleString(locale), tone: "text-foreground" },
  ];

  return (
    <section
      id="games-hero"
      aria-roledescription="carousel"
      aria-label={t("games.heroLabel")}
      className="games-hero relative isolate overflow-hidden border-b border-border"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div id="games-hero-stage" className="games-hero-stage relative h-[min(74vh,640px)] min-h-[460px]">
        {games.map((item, index) => (
          <div
            id={`games-hero-slide-${item.game_id}`}
            key={item.game_id}
            aria-hidden
            className={cn(
              "games-hero-slide absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
              index === active ? "opacity-100" : "opacity-0",
            )}
          >
            <div
              id={`games-hero-slide-${item.game_id}-art`}
              className={cn(
                "games-hero-slide-art absolute inset-0 transition-transform ease-out motion-reduce:transition-none",
                index === active ? "scale-100 duration-[9000ms]" : "scale-[1.06] duration-700",
                item.is_banned && "grayscale",
              )}
            >
              <GameCoverArt id={`games-hero-slide-${item.game_id}-art-image`} seedKey={item.game_id} cols={80} rows={34} />
            </div>
          </div>
        ))}
        <div id="games-hero-shade" aria-hidden className="games-hero-shade key-art-shade absolute inset-0" />
        <div id="games-hero-shade-side" aria-hidden className="games-hero-shade-side key-art-shade-side absolute inset-0 hidden md:block" />

        <div id="games-hero-content" className="games-hero-content absolute inset-x-0 bottom-0">
          <div id="games-hero-inner" className="games-hero-inner mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-8 sm:pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div
              id="games-hero-info"
              key={game.game_id}
              aria-live={isRunning ? "off" : "polite"}
              className="games-hero-info min-w-0 max-w-2xl flex-1 animate-[hero-in_600ms_cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none"
            >
              {game.is_banned && (
                <span id="games-hero-banned" className="games-hero-banned mb-4 inline-flex items-center gap-1.5 rounded-sm bg-destructive px-2 py-1 font-display text-sm font-semibold uppercase tracking-wide text-background">
                  <Ban id="games-hero-banned-icon" className="games-hero-banned-icon size-3.5" aria-hidden />
                  {t("games.banned")}
                </span>
              )}
              <h2
                id="games-hero-title"
                className="games-hero-title text-balance font-display text-5xl font-extrabold uppercase leading-[0.88] sm:text-6xl lg:text-7xl"
              >
                {game.game_name}
              </h2>
              <dl id="games-hero-stats" className="games-hero-stats mt-6 flex items-stretch gap-6">
                {stats.map((stat, index) => (
                  <div
                    id={`games-hero-stat-${stat.key}`}
                    key={stat.key}
                    className={cn("games-hero-stat flex flex-col-reverse", index > 0 && "border-l border-foreground/20 pl-6")}
                  >
                    <dt id={`games-hero-stat-${stat.key}-label`} className="games-hero-stat-label mt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {stat.label}
                    </dt>
                    <dd id={`games-hero-stat-${stat.key}-value`} className={cn("games-hero-stat-value tabular font-display text-4xl font-bold leading-none", stat.tone)}>
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p id="games-hero-dates" className="games-hero-dates mt-4 text-sm text-muted-foreground">
                <span id="games-hero-dates-last" className="games-hero-dates-last block sm:inline">
                  {t("games.lastPlayed", { date: formatDate(game.last_played_at, locale) })}
                </span>
                <span id="games-hero-dates-separator" aria-hidden className="games-hero-dates-separator mx-2 hidden text-foreground/30 sm:inline">
                  /
                </span>
                <span id="games-hero-dates-since" className="games-hero-dates-since block sm:inline">
                  {t("games.playingSince", { date: formatDate(game.first_played_at, locale) })}
                </span>
              </p>
              <div id="games-hero-actions" className="games-hero-actions mt-7 flex flex-wrap items-center gap-4">
                <Link id="games-hero-buy-sgem" href="/sgem" className={cn("games-hero-buy-sgem", buttonVariants({ size: "lg" }))}>
                  <SgemIcon id="games-hero-buy-sgem-icon" className="text-lg" />
                  {t("sgem.buy")}
                </Link>
              </div>
            </div>

            {games.length > 1 && (
              <div id="games-hero-picker" className="games-hero-picker shrink-0">
                <ul id="games-hero-thumbs" className="games-hero-thumbs hidden gap-2 sm:flex">
                  {games.map((item, index) => {
                    const isActive = index === active;
                    return (
                      <li id={`games-hero-thumb-${item.game_id}`} key={item.game_id} className="games-hero-thumb">
                        <button
                          id={`games-hero-thumb-${item.game_id}-button`}
                          type="button"
                          aria-label={t("games.heroSelect", { name: item.game_name })}
                          aria-current={isActive ? "true" : undefined}
                          onClick={() => select(index)}
                          className={cn(
                            "games-hero-thumb-button group relative block w-32 overflow-hidden rounded-sm border text-left transition-colors lg:w-[8.5rem]",
                            isActive ? "border-primary" : "border-foreground/15 hover:border-foreground/50",
                          )}
                        >
                          <span id={`games-hero-thumb-${item.game_id}-art`} className={cn("games-hero-thumb-art block aspect-video transition-opacity", isActive ? "opacity-100" : "opacity-60 group-hover:opacity-90")}>
                            <GameCoverArt id={`games-hero-thumb-${item.game_id}-art-image`} seedKey={item.game_id} cols={16} rows={9} />
                          </span>
                          <span id={`games-hero-thumb-${item.game_id}-name`} className="games-hero-thumb-name block truncate bg-background/90 px-2 py-1.5 font-display text-sm font-semibold uppercase tracking-wide">
                            {item.game_name}
                          </span>
                          {isActive && (
                            <span id={`games-hero-thumb-${item.game_id}-progress`} aria-hidden className="games-hero-thumb-progress absolute inset-x-0 top-0 h-0.5 bg-primary/30">
                              <span
                                id={`games-hero-thumb-${item.game_id}-progress-bar`}
                                key={cycle}
                                className={cn("games-hero-thumb-progress-bar block h-full bg-primary", isRunning ? "hero-progress" : "w-full")}
                                style={progressStyle}
                              />
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <ul id="games-hero-dots" className="games-hero-dots flex gap-1.5 sm:hidden">
                  {games.map((item, index) => (
                    <li id={`games-hero-dot-${item.game_id}`} key={item.game_id} className="games-hero-dot flex-1">
                      <button
                        id={`games-hero-dot-${item.game_id}-button`}
                        type="button"
                        aria-label={t("games.heroSelect", { name: item.game_name })}
                        aria-current={index === active ? "true" : undefined}
                        onClick={() => select(index)}
                        className="games-hero-dot-button flex h-6 w-full items-center"
                      >
                        <span id={`games-hero-dot-${item.game_id}-bar`} className={cn("games-hero-dot-bar block h-1 w-full rounded-full", index === active ? "bg-primary" : "bg-foreground/25")} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
