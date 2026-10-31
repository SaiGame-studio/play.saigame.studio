"use client";

import Link from "next/link";
import { gameDetailHref } from "@/components/games/game-switcher";
import { GameThumb } from "@/components/games/game-thumb";
import type { PlayedGame } from "@/lib/player-api";
import { cn } from "@/lib/utils";

type PosterGame = Pick<PlayedGame, "game_id" | "game_name" | "image_url">;

/**
 * Poster card for one game: its image (or generated art) and name; opens the game's page.
 * `base` names the list it belongs to (ids `{base}-{gameId}`, classes `{base}-…`).
 */
export function PlayedGameCard({ game, base = "played-game" }: { game: PosterGame; base?: string }) {
  const id = `${base}-${game.game_id}`;

  return (
    <li id={id} className={base}>
      <Link
        id={`${id}-link`}
        href={gameDetailHref(game.game_id)}
        className={cn(`${base}-link`, "group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background")}
      >
        <article
          id={`${id}-poster`}
          className={cn(`${base}-poster`, "relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-md border border-border bg-card transition-colors group-hover:border-primary")}
        >
          <GameThumb
            id={`${id}-art`}
            gameId={game.game_id}
            imageUrl={game.image_url}
            className={cn(`${base}-art`, "absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none")}
          />
          <div id={`${id}-shade`} aria-hidden className={cn(`${base}-shade`, "key-art-shade absolute inset-0")} />
          <h3
            id={`${id}-name`}
            className={cn(`${base}-name`, "relative line-clamp-2 text-balance p-4 font-display text-2xl font-bold uppercase leading-[0.95] [text-shadow:0_1px_2px_rgb(0_0_0/0.9),0_2px_12px_rgb(0_0_0/0.7)]")}
          >
            {game.game_name}
          </h3>
        </article>
      </Link>
    </li>
  );
}
