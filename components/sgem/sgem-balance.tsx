"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { SgemIcon } from "@/components/sgem/sgem-icon";
import { useTranslation } from "@/lib/i18n/use-translation";
import { SGEM_WALLET_REFRESH_EVENT, sgemApi } from "@/lib/sgem-api";
import { cn } from "@/lib/utils";

/** Header chip: sGem balance, buy link and refresh. */
export function SgemBalance() {
  const { t, locale } = useTranslation();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchWallet = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const wallet = await sgemApi.getWallet();
      setBalance(wallet?.balance ?? 0);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWallet();
    const onRefresh = () => void fetchWallet();
    window.addEventListener(SGEM_WALLET_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(SGEM_WALLET_REFRESH_EVENT, onRefresh);
  }, [fetchWallet]);

  return (
    <div id="sgem-balance" className="flex h-9 items-center gap-1 rounded-md border border-border bg-card/60 pl-2.5 pr-1 text-sm">
      <SgemIcon id="sgem-balance-icon" />
      <span id="sgem-balance-value" className="min-w-[2rem] text-center font-semibold tabular-nums" aria-label={t("sgem.balance")}>
        {isLoading && balance === null ? (
          <span id="sgem-balance-loading" className="inline-block h-3 w-8 animate-pulse rounded bg-muted" />
        ) : hasError ? (
          <span id="sgem-balance-error" className="text-destructive">—</span>
        ) : (
          (balance ?? 0).toLocaleString(locale)
        )}
      </span>
      <Link
        id="sgem-balance-buy-link"
        href="/sgem"
        title={t("sgem.buy")}
        aria-label={t("sgem.buy")}
        className="flex size-7 items-center justify-center rounded text-blue-400 hover:bg-muted hover:text-blue-300"
      >
        <Plus id="sgem-balance-buy-icon" className="size-4" aria-hidden />
      </Link>
      <button
        id="sgem-balance-refresh"
        type="button"
        title={t("sgem.refresh")}
        aria-label={t("sgem.refresh")}
        onClick={() => void fetchWallet()}
        disabled={isLoading}
        className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
      >
        <RefreshCw id="sgem-balance-refresh-icon" className={cn("size-3.5", isLoading && "animate-spin")} aria-hidden />
      </button>
    </div>
  );
}
