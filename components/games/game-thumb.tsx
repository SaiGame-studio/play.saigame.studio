"use client";

import { useState } from "react";
import { GameCoverArt } from "@/components/games/game-cover-art";
import { cn } from "@/lib/utils";

interface GameThumbProps {
  id: string;
  gameId: string;
  imageUrl: string | null;
  className?: string;
  /** Pixel grid of the generated art used when there is no image. */
  cols?: number;
  rows?: number;
}

/** The game's image, or its generated art when no image is set or it fails to load. Decorative. */
export function GameThumb({ id, gameId, imageUrl, className, cols = 15, rows = 20 }: GameThumbProps) {
  const [failed, setFailed] = useState(false);

  return (
    <span id={id} className={cn("game-thumb block overflow-hidden", className)}>
      {imageUrl && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- external image URL set in the Studio's game public info
        <img
          id={`${id}-image`}
          src={imageUrl}
          alt=""
          loading="lazy"
          className="game-thumb-image h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <GameCoverArt id={`${id}-art`} seedKey={gameId} cols={cols} rows={rows} />
      )}
    </span>
  );
}
