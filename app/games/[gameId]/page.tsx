import { Suspense } from "react";
import { GameDetailPage } from "@/components/game-detail/game-detail-page";

export default function GamePage() {
  return (
    <Suspense>
      <GameDetailPage />
    </Suspense>
  );
}
