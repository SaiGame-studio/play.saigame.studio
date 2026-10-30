"use client";

import { CheckCircle2 } from "lucide-react";
import { SgemIcon } from "@/components/sgem/sgem-icon";
import type { PaymentMethod, SgemPackage } from "@/lib/sgem-api";
import { formatMinorMoney, getLocalizedSgemPrice } from "@/lib/sgem-price";
import { cn } from "@/lib/utils";

interface SgemPackageGridProps {
  packages: SgemPackage[];
  selectedId: string | null;
  method: PaymentMethod | null;
  locale: string;
  onSelect: (pkg: SgemPackage) => void;
}

export function SgemPackageGrid({ packages, selectedId, method, locale, onSelect }: SgemPackageGridProps) {
  return (
    <div id="sgem-package-grid" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => {
        const id = `sgem-package-${pkg.id}`;
        const isSelected = selectedId === pkg.id;
        const price = getLocalizedSgemPrice(pkg, locale, method);
        return (
          <button
            id={id}
            key={pkg.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(pkg)}
            className={cn(
              "relative rounded-md border bg-card/70 p-5 text-left transition-all hover:border-primary/60",
              isSelected ? "border-primary ring-2 ring-primary/30" : "border-border",
            )}
          >
            {isSelected && <CheckCircle2 id={`${id}-selected`} className="absolute right-4 top-4 size-5 text-primary" aria-hidden />}
            <p id={`${id}-name`} className="pr-6 font-display text-base font-semibold">
              {pkg.name}
            </p>
            <p id={`${id}-description`} className="mt-1 line-clamp-2 h-10 text-xs text-muted-foreground">
              {pkg.description}
            </p>
            <div id={`${id}-footer`} className="mt-4 flex items-end justify-between gap-2">
              <p id={`${id}-amount`} className="flex items-center gap-1.5 font-display text-2xl font-bold tabular-nums">
                {pkg.sgem_amount.toLocaleString(locale)}
                <SgemIcon id={`${id}-amount-icon`} className="text-sm" />
              </p>
              <p id={`${id}-price`} className="whitespace-nowrap pb-0.5 font-semibold text-primary">
                {formatMinorMoney(price.amount, price.currency)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
