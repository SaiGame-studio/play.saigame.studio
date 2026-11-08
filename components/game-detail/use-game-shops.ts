"use client";

import { useCallback, useEffect, useState } from "react";
import { shopApi, type GameShop } from "@/lib/shop-api";
import { useAuth } from "@/contexts/auth-context";

/** Open shops of one game that the Studio shows in Sai Play. */
export function useGameShops(gameId: string) {
  const { isAuthenticated } = useAuth();
  const [shops, setShops] = useState<GameShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      setShops(await shopApi.listSaiPlayShops(gameId, isAuthenticated));
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [gameId, isAuthenticated]);

  useEffect(() => {
    void load();
  }, [load]);

  return { shops, isLoading, hasError, retry: load };
}
