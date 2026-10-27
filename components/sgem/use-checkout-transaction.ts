"use client";

import { useEffect, useRef, useState } from "react";
import { isWaiting, normalizeIntent, type PaymentIntent } from "@/lib/payment-intent";
import { readStorage } from "@/lib/safe-storage";
import { requestWalletRefresh, sgemApi, type PaymentStatus, type PaymentTransaction, type PurchaseResponse } from "@/lib/sgem-api";
import { CHECKOUT_STORAGE_PREFIX } from "@/components/sgem/use-sgem-shop";

const POLL_INTERVAL_MS = 5_000;

/** Loads a purchase (from the session hand-off or the API) and polls its status until it settles. */
export function useCheckoutTransaction(txId: string | null) {
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const settledRef = useRef(false);

  useEffect(() => {
    if (!txId) {
      setError("Missing transaction ID");
      setIsLoading(false);
      return;
    }
    const stored = readStorage(`${CHECKOUT_STORAGE_PREFIX}${txId}`, "session");
    if (stored) {
      try {
        const root = JSON.parse(stored) as PurchaseResponse;
        if (root.transaction) {
          setTransaction(root.transaction);
          setStatus(root.transaction.status ?? "awaiting_payment");
        }
        setIntent(normalizeIntent(root.intent));
        setIsLoading(false);
        return;
      } catch {
        // Fall through to fetching the transaction.
      }
    }
    sgemApi
      .getTransaction(txId)
      .then((data) => {
        const tx = data.transaction ?? data;
        setTransaction(tx);
        setStatus(tx.status ?? "pending");
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setIsLoading(false));
  }, [txId]);

  useEffect(() => {
    if (!txId || !isWaiting(status)) {
      return;
    }
    const timer = setInterval(async () => {
      try {
        const data = await sgemApi.getTransaction(txId);
        const next = (data.transaction ?? data).status;
        setStatus(next);
        if (next === "completed" && !settledRef.current) {
          settledRef.current = true;
          requestWalletRefresh();
        }
      } catch {
        // Ignore transient poll errors.
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [txId, status]);

  return { transaction, intent, status, setStatus, isLoading, error };
}
