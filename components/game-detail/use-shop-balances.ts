"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SGEM_WALLET_REFRESH_EVENT } from "@/lib/sgem-api";
import { loadShopBalances, shopCurrencyKey } from "@/lib/shop-balances";
import type { ShopListing } from "@/lib/shop-api";

/** Refresh balances after purchases, wallet updates, and returning to this tab. */
export function useShopBalances(gameId: string, items: ShopListing[]) {
  const currencyKeys = JSON.stringify([...new Set(items.map(shopCurrencyKey))].sort());
  const scope = `${gameId}:${currencyKeys}`;
  const [state, setState] = useState<{ scope: string; balances: Record<string, number> } | null>(null);
  const requestId = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++requestId.current;
    const balances = await loadShopBalances(gameId, JSON.parse(currencyKeys) as string[]);
    if (current === requestId.current) setState({ scope, balances });
  }, [gameId, currencyKeys, scope]);

  useEffect(() => {
    void refresh();
    const onRefresh = () => void refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener(SGEM_WALLET_REFRESH_EVENT, onRefresh);
    window.addEventListener("focus", onRefresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      requestId.current++;
      window.removeEventListener(SGEM_WALLET_REFRESH_EVENT, onRefresh);
      window.removeEventListener("focus", onRefresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return { balances: state?.scope === scope ? state.balances : {}, refresh };
}
