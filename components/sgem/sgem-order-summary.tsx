"use client";

import { Loader2, MessageCircle } from "lucide-react";
import { SgemIcon } from "@/components/sgem/sgem-icon";
import { PaymentMethodIcon } from "@/components/sgem/payment-method-icon";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { PaymentMethod, SgemPackage } from "@/lib/sgem-api";
import { formatMinorMoney, getLocalizedSgemPrice } from "@/lib/sgem-price";

interface SgemOrderSummaryProps {
  pkg: SgemPackage | null;
  method: PaymentMethod | null;
  isCheckingOut: boolean;
  error: string | null;
  onCheckout: () => void;
}

export function SgemOrderSummary({ pkg, method, isCheckingOut, error, onCheckout }: SgemOrderSummaryProps) {
  const { t, locale } = useTranslation();
  const price = pkg ? getLocalizedSgemPrice(pkg, locale, method) : null;

  return (
    <div id="sgem-order" className="space-y-3">
      <div id="sgem-order-card" className="space-y-4 rounded-md border border-border bg-card/70 p-5">
        <div id="sgem-order-package" className="space-y-1">
          <p id="sgem-order-package-label" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("sgem.packages")}
          </p>
          {pkg && price ? (
            <div id="sgem-order-package-selected" className="flex items-start justify-between gap-2">
              <div id="sgem-order-package-info">
                <p id="sgem-order-package-name" className="text-sm font-semibold">
                  {pkg.name}
                </p>
                <p id="sgem-order-package-amount" className="flex items-center gap-1 text-xs text-muted-foreground">
                  {pkg.sgem_amount.toLocaleString(locale)}
                  <SgemIcon id="sgem-order-package-amount-icon" />
                  sGem
                </p>
              </div>
              <p id="sgem-order-package-price" className="shrink-0 text-sm font-semibold text-primary">
                {formatMinorMoney(price.amount, price.currency)}
              </p>
            </div>
          ) : (
            <p id="sgem-order-package-empty" className="text-sm italic text-muted-foreground">
              {t("sgem.noPackageSelected")}
            </p>
          )}
        </div>

        <div id="sgem-order-divider-1" className="h-px bg-border" />

        <div id="sgem-order-method" className="space-y-1">
          <p id="sgem-order-method-label" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("sgem.methods")}
          </p>
          {method ? (
            <div id="sgem-order-method-selected" className="flex items-center gap-3">
              <span id="sgem-order-method-icon-wrap" className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted">
                <PaymentMethodIcon id="sgem-order-method-icon" providerKey={method.provider_key} />
              </span>
              <p id="sgem-order-method-name" className="text-sm font-semibold">
                {method.display_name}
              </p>
            </div>
          ) : (
            <p id="sgem-order-method-empty" className="text-sm italic text-muted-foreground">
              {t("sgem.noMethodSelected")}
            </p>
          )}
        </div>

        <div id="sgem-order-divider-2" className="h-px bg-border" />

        {error && <FormAlert id="sgem-order-error" tone="error" message={`${t("sgem.checkoutFailed")} ${error}`} />}
        <Button id="sgem-order-checkout" className="w-full" disabled={!pkg || !method || isCheckingOut} onClick={onCheckout}>
          {isCheckingOut && <Loader2 id="sgem-order-checkout-spinner" className="animate-spin" aria-hidden />}
          {t("sgem.proceed")}
        </Button>
      </div>
      <p id="sgem-order-discount-tip" className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
        <MessageCircle id="sgem-order-discount-tip-icon" className="size-3 shrink-0" aria-hidden />
        {t("sgem.discountTip")}
      </p>
    </div>
  );
}
