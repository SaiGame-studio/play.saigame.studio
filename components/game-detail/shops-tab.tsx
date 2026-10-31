"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight, Coins, Store } from "lucide-react";
import { ShopView } from "@/components/game-detail/shop-view";
import { SgemIcon } from "@/components/sgem/sgem-icon";
import { useGameShops } from "@/components/game-detail/use-game-shops";
import { LoadState } from "@/components/ui/load-state";
import type { GameCurrency } from "@/lib/game-info-api";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Shops tab: the game's main currency and its shops shown in Sai Play; the selected shop is kept in ?shop=. */
export function ShopsTab({ gameId, mainCurrency }: { gameId: string; mainCurrency: GameCurrency | null }) {
  return (
    <div id="shops-tab" className="shops-tab space-y-6">
      {mainCurrency && <MainCurrency currency={mainCurrency} />}
      <ShopsContent gameId={gameId} />
    </div>
  );
}

/** Tells players which currency the game mainly uses. */
function MainCurrency({ currency }: { currency: GameCurrency }) {
  const { t } = useTranslation();
  return (
    <p id="shops-main-currency" className="shops-main-currency inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
      {currency.type === "sgem" ? (
        <SgemIcon id="shops-main-currency-icon" className="shops-main-currency-icon" />
      ) : (
        <Coins id="shops-main-currency-icon" className="shops-main-currency-icon size-4 text-primary" aria-hidden />
      )}
      <span id="shops-main-currency-label" className="shops-main-currency-label text-muted-foreground">{t("shops.mainCurrency")}</span>
      <span id="shops-main-currency-name" className="shops-main-currency-name font-semibold">{currency.name}</span>
    </p>
  );
}

function ShopsContent({ gameId }: { gameId: string }) {
  const { t, locale } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { shops, isLoading, hasError, retry } = useGameShops(gameId);
  const listHref = `${pathname}?tab=shops`;
  const shopHref = (shopId: string) => `${pathname}?${new URLSearchParams({ tab: "shops", shop: shopId }).toString()}`;
  const selected = shops.find((shop) => shop.id === searchParams.get("shop"));

  if (selected) {
    return <ShopView key={selected.id} gameId={gameId} shop={selected} backHref={listHref} />;
  }

  return (
    <LoadState
      id="shops-list"
      state={isLoading ? "loading" : hasError ? "error" : "ready"}
      isEmpty={shops.length === 0}
      errorText={t("shops.loadFailed")}
      emptyText={t("shops.noShops")}
      retryText={t("games.retry")}
      onRetry={() => void retry()}
    >
      <ul id="shops-list" className="shops-list grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => {
          const id = `game-shop-${shop.id}`;
          return (
            <li id={id} key={shop.id} className="game-shop">
              <Link
                id={`${id}-link`}
                href={shopHref(shop.id)}
                scroll={false}
                className="game-shop-link group flex h-full flex-col rounded-md border border-border bg-card p-4 transition-colors hover:border-primary"
              >
                <div id={`${id}-head`} className="game-shop-head flex items-start gap-3">
                  <Store id={`${id}-icon`} className="game-shop-icon mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <h3 id={`${id}-name`} className="game-shop-name flex-1 font-display text-xl font-bold uppercase leading-tight">{shop.name}</h3>
                  <ChevronRight id={`${id}-chevron`} className="game-shop-chevron size-5 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden />
                </div>
                {shop.description && <p id={`${id}-description`} className="game-shop-description mt-2 line-clamp-2 text-sm text-muted-foreground">{shop.description}</p>}
                <p id={`${id}-meta`} className="game-shop-meta mt-auto pt-4 text-xs text-muted-foreground">
                  {t("shops.itemCount", { count: shop.item_count.toLocaleString(locale) })}
                  {shop.ends_at && ` · ${t("shops.endsAt", { date: new Date(shop.ends_at).toLocaleDateString(locale, { dateStyle: "medium" }) })}`}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </LoadState>
  );
}
