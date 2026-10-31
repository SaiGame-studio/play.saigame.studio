"use client";

import { useCallback, useEffect, useState } from "react";
import { shopApi, type GameShop } from "@/lib/shop-api";

/** Open shops of one game that the Studio shows in Sai Play. */
export function useGameShops(gameId: string) {
  const [shops, setShops] = useState<GameShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      setShops(await shopApi.listSaiPlayShops(gameId));
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { shops, isLoading, hasError, retry: load };
}
