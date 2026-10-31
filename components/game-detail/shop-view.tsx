"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ShopItemCard } from "@/components/game-detail/shop-item-card";
import { ShopPrice } from "@/components/game-detail/shop-price";
import { useShopItems } from "@/components/game-detail/use-shop-items";
import { FormAlert } from "@/components/ui/form-alert";
import { LoadState } from "@/components/ui/load-state";
import { useConfirm } from "@/contexts/confirm-context";
import { ApiError } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/use-translation";
import { requestWalletRefresh } from "@/lib/sgem-api";
import { shopApi, type GameShop, type ShopListing } from "@/lib/shop-api";

/** Purchase error message_code → translation key. */
const PURCHASE_ERRORS: Record<string, string> = {
  INSUFFICIENT_SGEM: "shops.errors.insufficientSgem",
  INSUFFICIENT_COINS: "shops.errors.insufficientFunds",
  SHOP_UNAVAILABLE: "shops.errors.shopUnavailable",
  SHOP_ITEM_UNAVAILABLE: "shops.errors.itemUnavailable",
  SHOP_ITEM_NOT_FOUND: "shops.errors.itemUnavailable",
  SHOP_ITEM_OUT_OF_STOCK: "shops.errors.outOfStock",
  SHOP_PURCHASE_LIMIT_REACHED: "shops.errors.limitReached",
};

type Notice = { tone: "success" | "error"; message: string };

/** One shop: its items with Buy, the purchase confirmation and the result. */
export function ShopView({ gameId, shop, backHref }: { gameId: string; shop: GameShop; backHref: string }) {
  const { t, locale } = useTranslation();
  const confirm = useConfirm();
  const { items, isLoading, hasError, retry, refresh } = useShopItems(gameId, shop.id);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const buy = async (item: ShopListing, quantity: number) => {
    setNotice(null);
    let delivered: GameShop["collect_destination"] = shop.collect_destination;
    try {
      const confirmed = await confirm({
        id: "shop-purchase-confirm",
        title: t("shops.confirmTitle", { name: item.display_name }),
        description: (
          <span id="shop-purchase-confirm-summary" className="shop-purchase-confirm-summary inline-flex flex-wrap items-center gap-1">
            {t("shops.confirmBody", { quantity, name: item.display_name })}
            <ShopPrice id="shop-purchase-confirm-total" item={item} amount={item.price * quantity} className="font-semibold text-foreground" />
          </span>
        ),
        confirmText: t("shops.buy"),
        onConfirm: async () => {
          setBuyingId(item.id);
          const result = await shopApi.purchase(gameId, shop.id, item.id, quantity);
          delivered = result.collect_destination ?? delivered;
        },
      });
      if (!confirmed) return;
      setNotice({ tone: "success", message: t(delivered === "inventory" ? "shops.boughtToInventory" : "shops.boughtToMailbox", { name: item.display_name }) });
      if (item.payment_currency_type === "sgem") requestWalletRefresh();
      void refresh();
    } catch (error) {
      const code = error instanceof ApiError ? error.code : undefined;
      setNotice({ tone: "error", message: t((code && PURCHASE_ERRORS[code]) || "shops.errors.purchaseFailed") });
      void refresh();
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <section id="shop-view" aria-labelledby="shop-view-title" className="shop-view space-y-6">
      <div id="shop-view-header" className="shop-view-header space-y-2">
        <Link id="shop-view-back" href={backHref} scroll={false} className="shop-view-back inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft id="shop-view-back-icon" className="shop-view-back-icon size-4" aria-hidden />
          {t("shops.allShops")}
        </Link>
        <h2 id="shop-view-title" className="shop-view-title font-display text-3xl font-extrabold uppercase leading-none">{shop.name}</h2>
        {shop.description && <p id="shop-view-description" className="shop-view-description max-w-2xl text-sm text-muted-foreground">{shop.description}</p>}
        {shop.ends_at && (
          <p id="shop-view-ends" className="shop-view-ends text-xs text-muted-foreground">
            {t("shops.endsAt", { date: new Date(shop.ends_at).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" }) })}
          </p>
        )}
      </div>

      {notice && <FormAlert id="shop-view-notice" tone={notice.tone} message={notice.message} />}

      <LoadState
        id="shop-view-items"
        state={isLoading ? "loading" : hasError && items.length === 0 ? "error" : "ready"}
        isEmpty={items.length === 0}
        errorText={t("shops.itemsLoadFailed")}
        emptyText={t("shops.noItems")}
        retryText={t("games.retry")}
        onRetry={() => void retry()}
      >
        <ul id="shop-view-items-grid" className="shop-view-items-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ShopItemCard key={item.id} item={item} isBuying={buyingId === item.id} disabled={buyingId !== null} onBuy={(next, quantity) => void buy(next, quantity)} />
          ))}
        </ul>
      </LoadState>
    </section>
  );
}
