"use client";

import { useMemo } from "react";
import { createGameArt } from "@/lib/game-art";
import { cn } from "@/lib/utils";

interface GameCoverArtProps {
  id: string;
  /** Seed for the generated art; use the game id so a game keeps its art everywhere. */
  seedKey: string;
  cols: number;
  rows: number;
  className?: string;
}

/** Generated pixel-crystal key art (stand-in until real game art exists). Decorative only. */
export function GameCoverArt({ id, seedKey, cols, rows, className }: GameCoverArtProps) {
  const art = useMemo(() => createGameArt(seedKey, cols, rows), [seedKey, cols, rows]);

  return (
    <svg
      id={id}
      aria-hidden
      focusable="false"
      viewBox={`0 0 ${art.cols} ${art.rows}`}
      preserveAspectRatio="xMidYMid slice"
      shapeRendering="crispEdges"
      className={cn("game-cover-art block h-full w-full", className)}
      style={{ backgroundColor: art.ground }}
    >
      {art.runs.map((run) => (
        <rect key={`${run.x}-${run.y}`} x={run.x} y={run.y} width={run.width + 0.02} height={1.02} fill={run.fill} />
      ))}
    </svg>
  );
}
