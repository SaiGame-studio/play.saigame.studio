"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { shopApi, type ShopListing } from "@/lib/shop-api";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Items on sale in one shop, with the signed-in player's purchase counts. */
export function useShopItems(gameId: string, shopId: string) {
  const { isAuthenticated } = useAuth();
  const { locale } = useTranslation();
  const requestVersion = useRef(0);
  const [items, setItems] = useState<ShopListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      const version = ++requestVersion.current;
      if (!silent) {
        setIsLoading(true);
        setItems([]);
      }
      setHasError(false);
      try {
        const data = await shopApi.listItems(gameId, shopId, locale, isAuthenticated);
        if (version === requestVersion.current) {
          setItems([...(data.items ?? [])].sort((a, b) => a.sort_order - b.sort_order));
        }
      } catch {
        if (version === requestVersion.current) setHasError(true);
      } finally {
        if (version === requestVersion.current) setIsLoading(false);
      }
    },
    [gameId, shopId, locale, isAuthenticated],
  );

  useEffect(() => {
    void load();
    return () => { requestVersion.current++; };
  }, [load]);

  return { items, isLoading, hasError, retry: () => load(), refresh: () => load(true) };
}
