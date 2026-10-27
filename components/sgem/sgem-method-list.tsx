"use client";

import { CheckCircle2 } from "lucide-react";
import { PaymentMethodIcon } from "@/components/sgem/payment-method-icon";
import type { PaymentMethod } from "@/lib/sgem-api";
import { cn } from "@/lib/utils";

interface SgemMethodListProps {
  methods: PaymentMethod[];
  selectedId: string | null;
  onToggle: (method: PaymentMethod) => void;
}

export function SgemMethodList({ methods, selectedId, onToggle }: SgemMethodListProps) {
  return (
    <div id="sgem-method-list" className="grid gap-3">
      {methods.map((method) => {
        const id = `sgem-method-${method.id}`;
        const isSelected = selectedId === method.id;
        return (
          <button
            id={id}
            key={method.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(method)}
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-card/70 p-3 text-left transition-all hover:border-primary/60 sm:p-4",
              isSelected ? "border-primary ring-1 ring-primary/50" : "border-border",
            )}
          >
            <span id={`${id}-icon-wrap`} className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
              <PaymentMethodIcon id={`${id}-icon`} providerKey={method.provider_key} />
            </span>
            <span id={`${id}-info`} className="min-w-0 flex-1">
              <span id={`${id}-name`} className="block text-sm font-semibold">
                {method.display_name}
              </span>
              {method.description && (
                <span id={`${id}-description`} className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                  {method.description}
                </span>
              )}
            </span>
            {isSelected && <CheckCircle2 id={`${id}-selected`} className="size-5 shrink-0 text-primary" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}
