"use client";

import { useState } from "react";
import { GameCoverArt } from "@/components/games/game-cover-art";
import type { PlayedGame } from "@/lib/player-api";

/** Poster card for one played game: the game's image (or generated art when it has none) and its name. */
export function PlayedGameCard({ game }: { game: PlayedGame }) {
  const id = `played-game-${game.game_id}`;
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(game.image_url) && !imageFailed;

  return (
    <li id={id} className="played-game">
      <article
        id={`${id}-poster`}
        className="played-game-poster relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-md border border-border bg-card"
      >
        <div id={`${id}-art`} className="played-game-art absolute inset-0">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- external image URL set in the Studio's game public info
            <img
              id={`${id}-image`}
              src={game.image_url ?? undefined}
              alt=""
              loading="lazy"
              className="played-game-image h-full w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <GameCoverArt id={`${id}-art-image`} seedKey={game.game_id} cols={15} rows={20} />
          )}
        </div>
        <div id={`${id}-shade`} aria-hidden className="played-game-shade key-art-shade absolute inset-0" />
        <h3
          id={`${id}-name`}
          className="played-game-name relative line-clamp-2 text-balance p-4 font-display text-2xl font-bold uppercase leading-[0.95] [text-shadow:0_1px_2px_rgb(0_0_0/0.9),0_2px_12px_rgb(0_0_0/0.7)]"
        >
          {game.game_name}
        </h3>
      </article>
    </li>
  );
}
