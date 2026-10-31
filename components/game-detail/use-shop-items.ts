"use client";

import { useCallback, useEffect, useState } from "react";
import { shopApi, type ShopListing } from "@/lib/shop-api";

/** Items on sale in one shop, with the signed-in player's purchase counts. */
export function useShopItems(gameId: string, shopId: string) {
  const [items, setItems] = useState<ShopListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      setHasError(false);
      try {
        const data = await shopApi.listItems(gameId, shopId);
        setItems([...(data.items ?? [])].sort((a, b) => a.sort_order - b.sort_order));
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [gameId, shopId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return { items, isLoading, hasError, retry: () => load(), refresh: () => load(true) };
}
