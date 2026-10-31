"use client";

import { PlayedGames } from "@/components/games/played-games";
import { PublicGames } from "@/components/games/public-games";
import { useAuth } from "@/contexts/auth-context";

/** Home: the signed-in player's games, then the games studios have made public (the only section for guests). */
export default function HomePage() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      {isAuthenticated && <PlayedGames />}
      <PublicGames />
    </>
  );
}
