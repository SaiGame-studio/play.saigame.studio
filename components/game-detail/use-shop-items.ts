"use client";

import { useCallback, useEffect, useState } from "react";
import { shopApi, type ShopListing } from "@/lib/shop-api";
import { useAuth } from "@/contexts/auth-context";

/** Items on sale in one shop, with the signed-in player's purchase counts. */
export function useShopItems(gameId: string, shopId: string) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<ShopListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      setHasError(false);
      try {
        const data = await shopApi.listItems(gameId, shopId, isAuthenticated);
        setItems([...(data.items ?? [])].sort((a, b) => a.sort_order - b.sort_order));
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [gameId, shopId, isAuthenticated],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return { items, isLoading, hasError, retry: () => load(), refresh: () => load(true) };
}
