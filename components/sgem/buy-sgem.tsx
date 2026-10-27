"use client";

import { BadgeCheck, Gem, ReceiptText } from "lucide-react";
import type { ReactNode } from "react";
import { SgemMethodList } from "@/components/sgem/sgem-method-list";
import { SgemOrderSummary } from "@/components/sgem/sgem-order-summary";
import { SgemPackageGrid } from "@/components/sgem/sgem-package-grid";
import { useSgemShop } from "@/components/sgem/use-sgem-shop";
import { LoadState } from "@/components/ui/load-state";
import { useTranslation } from "@/lib/i18n/use-translation";

function SectionTitle({ id, icon, children }: { id: string; icon: ReactNode; children: ReactNode }) {
  return (
    <h2 id={id} className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
      {icon}
      {children}
    </h2>
  );
}

export function BuySgem() {
  const { t, locale } = useTranslation();
  const shop = useSgemShop(locale);

  return (
    <section id="buy-sgem" className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10 sm:py-14">
      <header id="buy-sgem-header">
        <h1 id="buy-sgem-title" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t("sgem.buy")}
        </h1>
        <p id="buy-sgem-subtitle" className="mt-1 text-muted-foreground">
          {t("sgem.subtitle")}
        </p>
      </header>

      <div id="buy-sgem-packages">
        <SectionTitle id="buy-sgem-packages-title" icon={<Gem id="buy-sgem-packages-icon" className="size-5 text-primary" aria-hidden />}>
          {t("sgem.packages")}
        </SectionTitle>
        <LoadState
          id="buy-sgem-packages-state"
          state={shop.packagesState}
          isEmpty={shop.packages.length === 0}
          errorText={t("sgem.packagesError")}
          emptyText={t("sgem.noPackages")}
          retryText={t("games.retry")}
          onRetry={() => void shop.reloadPackages()}
        >
          <SgemPackageGrid
            packages={shop.packages}
            selectedId={shop.selectedPackage?.id ?? null}
            method={shop.selectedMethod}
            locale={locale}
            onSelect={shop.selectPackage}
          />
        </LoadState>
      </div>

      <div id="buy-sgem-checkout" className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div id="buy-sgem-methods">
          <SectionTitle id="buy-sgem-methods-title" icon={<BadgeCheck id="buy-sgem-methods-icon" className="size-5 text-primary" aria-hidden />}>
            {t("sgem.methods")}
          </SectionTitle>
          <LoadState
            id="buy-sgem-methods-state"
            state={shop.methodsState}
            isEmpty={shop.methods.length === 0}
            errorText={t("sgem.methodsError")}
            emptyText={t("sgem.noMethods")}
            retryText={t("games.retry")}
            onRetry={() => void shop.reloadMethods()}
          >
            <SgemMethodList methods={shop.methods} selectedId={shop.selectedMethod?.id ?? null} onToggle={shop.toggleMethod} />
          </LoadState>
        </div>
        <div id="buy-sgem-summary">
          <SectionTitle id="buy-sgem-summary-title" icon={<ReceiptText id="buy-sgem-summary-icon" className="size-5 text-primary" aria-hidden />}>
            {t("sgem.orderSummary")}
          </SectionTitle>
          <SgemOrderSummary
            pkg={shop.selectedPackage}
            method={shop.selectedMethod}
            isCheckingOut={shop.isCheckingOut}
            error={shop.checkoutError}
            onCheckout={() => void shop.checkout()}
          />
        </div>
      </div>
    </section>
  );
}
