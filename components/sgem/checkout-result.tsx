"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/use-translation";

type Outcome = "completed" | "failed" | "expired" | "credit_failed" | "error";

const ICONS = {
  completed: { Icon: CheckCircle2, className: "text-primary" },
  failed: { Icon: XCircle, className: "text-destructive" },
  expired: { Icon: XCircle, className: "text-destructive" },
  error: { Icon: XCircle, className: "text-destructive" },
  credit_failed: { Icon: AlertTriangle, className: "text-yellow-400" },
} as const;

/** Final state of a checkout: success, failure, expiry, credit failure or load error. */
export function CheckoutResult({ outcome, amount, detail }: { outcome: Outcome; amount?: number; detail?: string }) {
  const { t, locale } = useTranslation();
  const { Icon, className } = ICONS[outcome];
  const description =
    outcome === "completed" ? t("checkout.successDesc", { amount: (amount ?? 0).toLocaleString(locale) }) : detail ?? t(`checkout.${outcome}Desc`);

  return (
    <section id="checkout-result" className="flex flex-1 items-center justify-center px-4 py-16">
      <div id="checkout-result-body" className="max-w-md space-y-4 text-center">
        <Icon id="checkout-result-icon" className={`mx-auto size-14 ${className}`} aria-hidden />
        <h1 id="checkout-result-title" className="font-display text-2xl font-bold">
          {t(`checkout.${outcome}Title`)}
        </h1>
        <p id="checkout-result-description" className="text-sm text-muted-foreground">
          {description}
        </p>
        <Link id="checkout-result-back" href="/sgem" className={buttonVariants({ variant: "outline" })}>
          {t("checkout.back")}
        </Link>
      </div>
    </section>
  );
}
