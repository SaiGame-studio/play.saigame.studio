"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Gamepad2, Loader2, Search } from "lucide-react";
import { GameThumb } from "@/components/games/game-thumb";
import { useAllPlayedGames } from "@/components/games/use-all-played-games";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

export function gameDetailHref(gameId: string) {
  return `/games/${encodeURIComponent(gameId)}`;
}

/** Header dropdown: searchable list of the player's games; picking one opens its detail page. */
export function GameSwitcher() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { games, isLoading, hasError, load } = useAllPlayedGames();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isActive = pathname.startsWith("/games/");

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return needle ? games.filter((game) => game.game_name.toLocaleLowerCase().includes(needle)) : games;
  }, [games, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    void load();
    inputRef.current?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, load]);

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      const game = filtered[activeIndex];
      if (game) {
        event.preventDefault();
        router.push(gameDetailHref(game.game_id));
      }
    }
  };

  const activeOptionId = filtered[activeIndex] ? `game-switcher-option-${filtered[activeIndex].game_id}` : undefined;

  return (
    <div id="game-switcher" ref={rootRef} className="game-switcher relative flex items-stretch">
      <button
        id="game-switcher-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={t("nav.games")}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "game-switcher-trigger main-nav-item relative flex items-center gap-2 px-2.5 font-display text-base font-semibold uppercase tracking-[0.08em] transition-colors md:px-3",
          "after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:bg-primary after:transition-transform after:duration-200",
          isActive || isOpen ? "text-foreground after:scale-x-100" : "text-muted-foreground after:scale-x-0 hover:text-foreground",
        )}
      >
        <Gamepad2 id="game-switcher-trigger-icon" className="game-switcher-trigger-icon size-4" aria-hidden />
        <span id="game-switcher-trigger-label" className="game-switcher-trigger-label hidden md:inline">
          {t("nav.games")}
        </span>
        <ChevronDown
          id="game-switcher-trigger-chevron"
          className={cn("game-switcher-trigger-chevron size-4 transition-transform", isOpen && "rotate-180")}
          aria-hidden
        />
      </button>

      {isOpen && (
        <div
          id="game-switcher-panel"
          className="game-switcher-panel absolute left-0 top-full z-30 w-[min(20rem,calc(100vw-2rem))] rounded-b-md border border-t-0 border-border bg-card shadow-[0_24px_60px_-20px_rgb(0_0_0/0.7)]"
        >
          <div id="game-switcher-search" className="game-switcher-search relative border-b border-border p-2">
            <Search id="game-switcher-search-icon" className="game-switcher-search-icon pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              id="game-switcher-search-input"
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded
              aria-controls="game-switcher-list"
              aria-activedescendant={activeOptionId}
              aria-autocomplete="list"
              aria-label={t("games.searchPlaceholder")}
              placeholder={t("games.searchPlaceholder")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              className="game-switcher-search-input h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {isLoading ? (
            <p id="game-switcher-loading" className="game-switcher-status flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
              <Loader2 id="game-switcher-loading-icon" className="game-switcher-loading-icon size-4 animate-spin text-primary" aria-hidden />
              {t("common.loading")}
            </p>
          ) : hasError ? (
            <div id="game-switcher-error" className="game-switcher-status flex items-center justify-between gap-3 px-4 py-4 text-sm text-destructive">
              <span id="game-switcher-error-text" className="game-switcher-error-text">{t("games.loadFailed")}</span>
              <button id="game-switcher-retry" type="button" onClick={() => void load()} className="game-switcher-retry text-foreground underline">
                {t("games.retry")}
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p id="game-switcher-empty" className="game-switcher-status px-4 py-4 text-sm text-muted-foreground">
              {games.length === 0 ? t("games.emptyTitle") : t("games.noMatch")}
            </p>
          ) : (
            <ul id="game-switcher-list" role="listbox" aria-label={t("nav.games")} className="game-switcher-list max-h-80 overflow-y-auto p-1">
              {filtered.map((game, index) => (
                <li id={`game-switcher-option-${game.game_id}`} key={game.game_id} role="option" aria-selected={index === activeIndex} className="game-switcher-option">
                  <Link
                    id={`game-switcher-option-${game.game_id}-link`}
                    href={gameDetailHref(game.game_id)}
                    tabIndex={-1}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "game-switcher-option-link flex items-center gap-3 rounded px-2 py-1.5 text-sm",
                      index === activeIndex ? "bg-muted text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <GameThumb id={`game-switcher-option-${game.game_id}-thumb`} gameId={game.game_id} imageUrl={game.image_url} className="h-10 w-[1.875rem] shrink-0 rounded-sm" />
                    <span id={`game-switcher-option-${game.game_id}-name`} className="game-switcher-option-name truncate font-medium">
                      {game.game_name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
