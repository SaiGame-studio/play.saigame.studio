import { Suspense, type ReactNode } from "react";
import { GameDetailPage } from "@/components/game-detail/game-detail-page";

/** The game page lives in the layout so switching tabs or shops (child routes) keeps it mounted. */
export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <GameDetailPage />
      {children}
    </Suspense>
  );
}
