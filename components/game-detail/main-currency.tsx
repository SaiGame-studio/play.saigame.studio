"use client";

import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { SgemIcon } from "@/components/sgem/sgem-icon";
import { useCurrencyBalances } from "@/components/game-detail/use-shop-balances";
import type { GameCurrency } from "@/lib/game-info-api";
import { useTranslation } from "@/lib/i18n/use-translation";
import { SHOP_PURCHASE_EVENT, type ShopPurchaseSpend } from "@/lib/shop-balances";
import styles from "./main-currency.module.css";

/** Main currency balance with a falling debit for each completed purchase. */
export function MainCurrency({ gameId, currency }: { gameId: string; currency: GameCurrency }) {
  const { locale } = useTranslation();
  const key = currency.type === "sgem" ? "sgem" : currency.item_def_id;
  const { balances } = useCurrencyBalances(gameId, key ? [key] : []);
  const balance = key ? balances[key] : undefined;
  const [spends, setSpends] = useState<ShopPurchaseSpend[]>([]);

  useEffect(() => {
    setSpends([]);
    const onPurchase = (event: Event) => {
      const spend = (event as CustomEvent<ShopPurchaseSpend>).detail;
      if (spend.gameId === gameId && spend.currencyKey === key && spend.amount > 0) {
        setSpends((previous) => [...previous, spend]);
      }
    };
    window.addEventListener(SHOP_PURCHASE_EVENT, onPurchase);
    return () => window.removeEventListener(SHOP_PURCHASE_EVENT, onPurchase);
  }, [gameId, key]);

  return (
    <p id="shops-main-currency" className="shops-main-currency relative inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
      {currency.type === "sgem" ? (
        <SgemIcon id="shops-main-currency-icon" className="shops-main-currency-icon" />
      ) : (
        <Coins id="shops-main-currency-icon" className="shops-main-currency-icon size-4 text-primary" aria-hidden />
      )}
      <span id="shops-main-currency-name" className="shops-main-currency-name font-semibold">{currency.name}</span>
      <span id="shops-main-currency-balance" className="shops-main-currency-balance font-semibold tabular-nums" aria-live="polite" aria-atomic="true">
        {balance === undefined ? "—" : balance.toLocaleString(locale)}
      </span>
      {spends.map((spend) => (
        <span
          id={`shops-main-currency-spend-${spend.id}`}
          key={spend.id}
          className={`shops-main-currency-spend ${styles.debit} pointer-events-none absolute right-3 top-full z-20 inline-flex items-center gap-1 whitespace-nowrap font-bold tabular-nums text-destructive`}
          onAnimationEnd={() => setSpends((previous) => previous.filter((entry) => entry.id !== spend.id))}
          aria-hidden="true"
        >
          {currency.type === "sgem" && <SgemIcon id={`shops-main-currency-spend-icon-${spend.id}`} />}
          −{spend.amount.toLocaleString(locale)}
        </span>
      ))}
    </p>
  );
}
