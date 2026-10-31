"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { GameInfoTab } from "@/components/game-detail/game-info-tab";
import { MyItemsTab } from "@/components/game-detail/my-items-tab";
import { ShopsTab } from "@/components/game-detail/shops-tab";
import { useGameProfile } from "@/components/game-detail/use-game-profile";
import { useGamePublicInfo } from "@/components/game-detail/use-game-public-info";
import { GameThumb } from "@/components/games/game-thumb";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

/** `profileOnly` tabs call game APIs, which need the player's gamer profile in the game. */
const TABS = [
  { key: "detail", labelKey: "gameDetail.tabDetail", profileOnly: false },
  { key: "items", labelKey: "gameDetail.tabItems", profileOnly: true },
  { key: "shops", labelKey: "gameDetail.tabShops", profileOnly: true },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function parseTab(value: string | null, hasGameAccess: boolean): TabKey {
  const tab = TABS.find((entry) => entry.key === value);
  return tab && (hasGameAccess || !tab.profileOnly) ? tab.key : "detail";
}

/**
 * /games/[gameId]: the game's header and tabs (kept in ?tab=). My Items and Shops appear only when the
 * player has an unbanned gamer profile in the game, so their game APIs are never called without one.
 */
export function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { info, isLoading: isInfoLoading, hasError, isNotPublic, retry } = useGamePublicInfo(gameId);
  const { isLoading: isProfileLoading, hasGameAccess } = useGameProfile(gameId);
  const isLoading = isInfoLoading || isProfileLoading;
  const tab = parseTab(searchParams.get("tab"), hasGameAccess);
  const tabs = TABS.filter((entry) => hasGameAccess || !entry.profileOnly);

  const selectTab = (next: TabKey) => {
    router.replace(next === "detail" ? pathname : `${pathname}?tab=${next}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div id="game-detail-loading" className="game-detail-loading flex items-center gap-3 px-4 py-16 text-muted-foreground sm:justify-center">
        <Loader2 id="game-detail-loading-icon" className="game-detail-loading-icon size-5 animate-spin text-primary" aria-hidden />
        <span id="game-detail-loading-text" className="game-detail-loading-text">{t("common.loading")}</span>
      </div>
    );
  }

  if (hasError || !info) {
    return (
      <section id="game-detail-error" className="game-detail-error mx-auto w-full max-w-6xl space-y-4 px-4 py-16">
        <FormAlert id="game-detail-error-alert" tone="error" message={t(isNotPublic ? "gameDetail.notPublic" : "gameDetail.loadFailed")} />
        <div id="game-detail-error-actions" className="game-detail-error-actions flex gap-3">
          {!isNotPublic && (
            <Button id="game-detail-retry" variant="outline" size="sm" onClick={() => void retry()}>
              {t("games.retry")}
            </Button>
          )}
          <Link id="game-detail-error-home" href="/" className="game-detail-error-home self-center text-sm text-muted-foreground hover:text-foreground hover:underline">
            {t("common.backHome")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div id="game-detail" className="game-detail mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:pt-10">
      {isAuthenticated && (
        <Link id="game-detail-back" href="/" className="game-detail-back inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft id="game-detail-back-icon" className="game-detail-back-icon size-4" aria-hidden />
          {t("games.title")}
        </Link>
      )}

      <header id="game-detail-header" className="game-detail-header mt-5 flex items-end gap-5">
        <GameThumb
          id="game-detail-thumb"
          gameId={gameId}
          imageUrl={info.image_url}
          className="aspect-[3/4] w-24 shrink-0 rounded-md border border-border sm:w-32"
        />
        <h1 id="game-detail-title" className="game-detail-title text-balance pb-1 font-display text-4xl font-extrabold uppercase leading-[0.9] sm:text-6xl">
          {info.game_name}
        </h1>
      </header>

      <div id="game-detail-tabs" role="tablist" aria-label={info.game_name} className="game-detail-tabs mt-8 flex gap-1 border-b border-border">
        {tabs.map(({ key, labelKey }) => {
          const selected = tab === key;
          return (
            <button
              id={`game-detail-tab-${key}`}
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`game-detail-panel-${key}`}
              onClick={() => selectTab(key)}
              className={cn(
                "game-detail-tab relative px-3 pb-3 pt-1 font-display text-lg font-semibold uppercase tracking-[0.06em] transition-colors",
                "after:absolute after:inset-x-2 after:-bottom-px after:h-[3px] after:bg-primary after:transition-transform after:duration-200",
                selected ? "text-foreground after:scale-x-100" : "text-muted-foreground after:scale-x-0 hover:text-foreground",
              )}
            >
              {t(labelKey)}
            </button>
          );
        })}
      </div>

      <div id={`game-detail-panel-${tab}`} role="tabpanel" aria-labelledby={`game-detail-tab-${tab}`} className="game-detail-panel pt-8">
        {tab === "detail" ? <GameInfoTab info={info} /> : tab === "items" ? <MyItemsTab gameId={gameId} /> : <ShopsTab gameId={gameId} />}
      </div>
    </div>
  );
}
