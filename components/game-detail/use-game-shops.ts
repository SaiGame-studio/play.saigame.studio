"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { shopApi, type GameShop } from "@/lib/shop-api";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Open shops of one game that the Studio shows in Sai Play. */
export function useGameShops(gameId: string) {
  const { locale } = useTranslation();
  const version = useRef(0);
  const [shops, setShops] = useState<GameShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(async () => {
    const request = ++version.current;
    setShops([]);
    setIsLoading(true);
    setHasError(false);
    try {
      const next = await shopApi.listSaiPlayShops(gameId, locale);
      if (request === version.current) setShops(next);
    } catch {
      if (request === version.current) setHasError(true);
    } finally {
      if (request === version.current) setIsLoading(false);
    }
  }, [gameId, locale]);

  useEffect(() => {
    void load();
    return () => { version.current++; };
  }, [load]);

  return { shops, isLoading, hasError, retry: load };
}
