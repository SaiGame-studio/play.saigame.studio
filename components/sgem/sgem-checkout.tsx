"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Clock, Copy, Loader2 } from "lucide-react";
import { CheckoutResult } from "@/components/sgem/checkout-result";
import { useCheckoutTransaction } from "@/components/sgem/use-checkout-transaction";
import { buttonVariants } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/use-translation";
import { isWaiting } from "@/lib/payment-intent";
import { formatMoney } from "@/lib/sgem-price";
import { cn } from "@/lib/utils";

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState(-1); // -1 = not started
  useEffect(() => {
    if (!expiresAt) {
      return;
    }
    const tick = () => setRemaining(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  const safe = Math.max(0, remaining);
  return { remaining, display: `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}` };
}

function CopyButton({ id, text, label }: { id: string; text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      id={id}
      type="button"
      title={label}
      aria-label={label}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border hover:border-primary/60"
    >
      {copied ? <Check id={`${id}-icon-done`} className="size-3.5 text-primary" aria-hidden /> : <Copy id={`${id}-icon`} className="size-3.5" aria-hidden />}
    </button>
  );
}

export function SgemCheckout() {
  const txId = useSearchParams().get("tx_id");
  const { t, locale } = useTranslation();
  const { transaction, intent, status, setStatus, isLoading, error } = useCheckoutTransaction(txId);
  const countdown = useCountdown(intent?.expiresAt || null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (countdown.remaining > 0) startedRef.current = true;
    if (countdown.remaining === 0 && startedRef.current && isWaiting(status)) setStatus("expired");
  }, [countdown.remaining, status, setStatus]);

  useEffect(() => {
    if (!intent?.payUrl || !isWaiting(status)) return;
    const timer = setTimeout(() => window.location.assign(intent.payUrl), 800);
    return () => clearTimeout(timer);
  }, [intent?.payUrl, status]);

  if (isLoading) {
    return (
      <div id="sgem-checkout-loading" className="flex flex-1 items-center justify-center py-20">
        <Loader2 id="sgem-checkout-loading-icon" className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }
  if (error) return <CheckoutResult outcome="error" detail={error} />;
  if (!isWaiting(status)) {
    return <CheckoutResult outcome={status as "completed" | "failed" | "expired" | "credit_failed"} amount={transaction?.currency_amount} />;
  }

  return (
    <section id="sgem-checkout" className="mx-auto w-full max-w-lg space-y-6 px-4 py-10">
      <header id="sgem-checkout-header" className="flex items-center gap-4">
        <Link id="sgem-checkout-back" href="/sgem" aria-label={t("checkout.back")} className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft id="sgem-checkout-back-icon" aria-hidden />
        </Link>
        <div id="sgem-checkout-heading">
          <h1 id="sgem-checkout-title" className="font-display text-xl font-bold">
            {t("checkout.title")}
          </h1>
          <p id="sgem-checkout-subtitle" className="text-sm text-muted-foreground">
            {t("checkout.subtitle")}
          </p>
        </div>
      </header>

      {intent?.expiresAt && (
        <p id="sgem-checkout-countdown" className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock id="sgem-checkout-countdown-icon" className="size-4" aria-hidden />
          {t("checkout.expiresIn")}
          <span
            id="sgem-checkout-countdown-value"
            className={cn("rounded-md px-2.5 py-0.5 font-mono text-sm", countdown.remaining < 300 ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground")}
          >
            {countdown.display}
          </span>
        </p>
      )}

      {intent?.payUrl ? (
        <div id="sgem-checkout-redirect" className="space-y-4 rounded-2xl border border-border bg-card/70 p-6 text-center">
          <p id="sgem-checkout-redirect-title" className="font-semibold">
            {t("checkout.redirectTitle")}
          </p>
          <p id="sgem-checkout-redirect-description" className="text-sm text-muted-foreground">
            {t("checkout.redirectDesc")}
          </p>
          <a id="sgem-checkout-pay-now" href={intent.payUrl} className={buttonVariants()}>
            {t("checkout.payNow")}
            <ArrowRight id="sgem-checkout-pay-now-icon" aria-hidden />
          </a>
        </div>
      ) : (
        intent && (
          <>
            {intent.qrCodeData && (
              <div id="sgem-checkout-qr" className="rounded-2xl border border-border bg-card/70 p-5 text-center">
                <p id="sgem-checkout-qr-title" className="mb-3 font-semibold">
                  {t("checkout.scanQr")}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img id="sgem-checkout-qr-image" src={intent.qrCodeData} alt="VietQR" className="mx-auto size-64 rounded-lg bg-white p-2" />
              </div>
            )}
            <div id="sgem-checkout-details" className="space-y-3 rounded-2xl border border-border bg-card/70 p-4">
              <div id="sgem-checkout-note" className="flex items-center justify-between gap-2">
                <div id="sgem-checkout-note-info">
                  <p id="sgem-checkout-note-label" className="text-xs text-muted-foreground">
                    {t("checkout.transferNote")}
                  </p>
                  <p id="sgem-checkout-note-value" className="font-mono font-semibold text-primary">
                    {intent.transferNote}
                  </p>
                </div>
                <CopyButton id="sgem-checkout-note-copy" text={intent.transferNote} label={t("checkout.copy")} />
              </div>
              <div id="sgem-checkout-details-divider" className="h-px bg-border" />
              <div id="sgem-checkout-amount" className="flex items-center justify-between gap-2">
                <div id="sgem-checkout-amount-info">
                  <p id="sgem-checkout-amount-label" className="text-xs text-muted-foreground">
                    {t("checkout.amount")}
                  </p>
                  <p id="sgem-checkout-amount-value" className="text-lg font-semibold text-primary">
                    {formatMoney(intent.transferAmount, transaction?.currency ?? "VND")}
                  </p>
                </div>
                <CopyButton id="sgem-checkout-amount-copy" text={String(intent.transferAmount)} label={t("checkout.copy")} />
              </div>
            </div>
            <p id="sgem-checkout-warning" className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs text-muted-foreground">
              <AlertTriangle id="sgem-checkout-warning-icon" className="mt-0.5 size-4 shrink-0 text-yellow-400" aria-hidden />
              {t("checkout.warning")}
            </p>
          </>
        )
      )}

      <p id="sgem-checkout-waiting" className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 id="sgem-checkout-waiting-icon" className="size-3 animate-spin" aria-hidden />
        {t("checkout.waiting")}
      </p>
      {transaction && (
        <p id="sgem-checkout-receive" className="text-center text-sm text-muted-foreground">
          {t("checkout.youWillReceive")}{" "}
          <span id="sgem-checkout-receive-amount" className="font-semibold text-primary">
            {(transaction.currency_amount ?? 0).toLocaleString(locale)} sGem
          </span>
        </p>
      )}
    </section>
  );
}
