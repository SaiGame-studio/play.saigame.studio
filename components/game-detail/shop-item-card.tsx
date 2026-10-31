"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { ShopPrice } from "@/components/game-detail/shop-price";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/use-translation";
import { remainingForPlayer, type ShopListing } from "@/lib/shop-api";

const MAX_QUANTITY = 99;

interface ShopItemCardProps {
  item: ShopListing;
  isBuying: boolean;
  disabled: boolean;
  onBuy: (item: ShopListing, quantity: number) => void;
}

/** One item on sale: name, price, the player's purchase limit, quantity and Buy. */
export function ShopItemCard({ item, isBuying, disabled, onBuy }: ShopItemCardProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const id = `shop-item-${item.id}`;
  const remaining = remainingForPlayer(item);
  const maxQuantity = remaining === null ? MAX_QUANTITY : Math.min(MAX_QUANTITY, remaining);
  const soldOut = remaining === 0;
  const safeQuantity = Math.min(Math.max(1, quantity), Math.max(1, maxQuantity));

  return (
    <li id={id} className="shop-item flex flex-col rounded-md border border-border bg-card p-4">
      <h3 id={`${id}-name`} className="shop-item-name font-display text-xl font-bold uppercase leading-tight">{item.display_name}</h3>
      {item.description && (
        <p id={`${id}-description`} className="shop-item-description mt-1 line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
      )}

      <div id={`${id}-meta`} className="shop-item-meta mt-auto space-y-1 pt-4 text-sm">
        <ShopPrice id={`${id}-price`} item={item} amount={item.price} className="text-lg font-semibold" />
        {remaining !== null && (
          <p id={`${id}-limit`} className="shop-item-limit text-xs text-muted-foreground">
            {t("shops.purchasedOf", { count: item.purchased_count ?? 0, limit: item.purchase_limit })}
            {item.restock_schedule !== "none" && ` · ${t(`shops.restock.${item.restock_schedule}`)}`}
          </p>
        )}
      </div>

      <div id={`${id}-actions`} className="shop-item-actions mt-4 flex items-center gap-2">
        <div id={`${id}-quantity`} className="shop-item-quantity flex h-9 items-center rounded-md border border-border">
          <button
            id={`${id}-quantity-decrease`}
            type="button"
            aria-label={t("shops.decrease")}
            disabled={soldOut || safeQuantity <= 1}
            onClick={() => setQuantity(safeQuantity - 1)}
            className="shop-item-quantity-decrease flex size-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <Minus id={`${id}-quantity-decrease-icon`} className="shop-item-quantity-decrease-icon size-4" aria-hidden />
          </button>
          <span id={`${id}-quantity-value`} aria-label={t("shops.quantity")} className="shop-item-quantity-value tabular w-8 text-center text-sm">
            {soldOut ? 0 : safeQuantity}
          </span>
          <button
            id={`${id}-quantity-increase`}
            type="button"
            aria-label={t("shops.increase")}
            disabled={soldOut || safeQuantity >= maxQuantity}
            onClick={() => setQuantity(safeQuantity + 1)}
            className="shop-item-quantity-increase flex size-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <Plus id={`${id}-quantity-increase-icon`} className="shop-item-quantity-increase-icon size-4" aria-hidden />
          </button>
        </div>
        <Button
          id={`${id}-buy`}
          size="sm"
          className="shop-item-buy flex-1"
          disabled={disabled || soldOut}
          onClick={() => onBuy(item, safeQuantity)}
        >
          {soldOut ? t("shops.limitReached") : isBuying ? t("shops.buying") : t("shops.buy")}
        </Button>
      </div>
    </li>
  );
}
