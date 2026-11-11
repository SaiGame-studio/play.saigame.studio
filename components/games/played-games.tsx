"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PlayedGamesSection } from "@/components/games/played-games-section";
import { useHasOwnedGames } from "@/components/games/use-has-owned-games";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { PlayedGameScope } from "@/lib/player-api";
import { cn } from "@/lib/utils";

const SUB_TABS = [
  { scope: "played", href: "/", labelKey: "games.playedTitle" },
  { scope: "owned", href: "/?games=owned", labelKey: "games.ownedTitle" },
] as const satisfies readonly { scope: PlayedGameScope; href: string; labelKey: string }[];

/**
 * Home "My games" tab, split into two link sub-tabs kept in ?games=:
 * games I play (other studios' public games, public info) and games I make (my studios' games, studio data).
 * The sub-tabs only show when the player has games I make; otherwise only games I play are shown.
 */
export function PlayedGames() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const hasOwnedGames = useHasOwnedGames();
  const wantsOwned = searchParams.get("games") === "owned";
  const scope: PlayedGameScope = wantsOwned && hasOwnedGames ? "owned" : "played";
  // Wait for the check before falling back, so ?games=owned does not flash the played list.
  const isResolving = wantsOwned && hasOwnedGames === null;

  return (
    <div id="played-games" className="played-games flex flex-1 flex-col">
      {hasOwnedGames && (
        <div id="played-games-tabs-row" className="played-games-tabs-row mx-auto w-full max-w-6xl px-4 pt-6">
          <nav id="played-games-tabs" aria-label={t("home.tabMyGames")} className="played-games-tabs flex gap-5">
            {SUB_TABS.map(({ scope: tabScope, href, labelKey }) => {
              const active = scope === tabScope;
              return (
                <Link
                  id={`played-games-tab-${tabScope}`}
                  key={tabScope}
                  href={href}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "played-games-tab pb-1.5 font-display text-base font-semibold uppercase tracking-[0.06em] underline-offset-[6px] transition-colors",
                    active ? "text-foreground underline decoration-primary decoration-2" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
      {!isResolving && (
        <PlayedGamesSection key={scope} scope={scope} labelledBy={hasOwnedGames ? `played-games-tab-${scope}` : "home-tab-my-games"} />
      )}
    </div>
  );
}
