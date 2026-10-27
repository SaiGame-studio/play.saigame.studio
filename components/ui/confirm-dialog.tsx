"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  id: string;
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Modal confirmation. Esc or clicking the backdrop cancels; focus starts on Cancel. */
export function ConfirmDialog({ id, open, title, description, confirmText, cancelText, isConfirming = false, onConfirm, onCancel }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isConfirming) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, isConfirming, onCancel]);

  if (!open) return null;

  return (
    <div id={id} className={cn(id, "fixed inset-0 z-50 flex items-center justify-center p-4")}>
      <div
        id={`${id}-backdrop`}
        aria-hidden
        className={cn(`${id}-backdrop`, "absolute inset-0 bg-black/60 backdrop-blur-sm")}
        onClick={() => !isConfirming && onCancel()}
      />
      <div
        id={`${id}-panel`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        className={cn(`${id}-panel`, "relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/50")}
      >
        <h2 id={`${id}-title`} className={cn(`${id}-title`, "font-display text-lg font-semibold")}>
          {title}
        </h2>
        <p id={`${id}-description`} className={cn(`${id}-description`, "mt-2 text-sm text-muted-foreground")}>
          {description}
        </p>
        <div id={`${id}-actions`} className={cn(`${id}-actions`, "mt-6 flex justify-end gap-2")}>
          <Button id={`${id}-cancel`} ref={cancelRef} variant="ghost" className={`${id}-cancel`} onClick={onCancel} disabled={isConfirming}>
            {cancelText}
          </Button>
          <Button
            id={`${id}-confirm`}
            className={cn(`${id}-confirm`, "bg-destructive text-white shadow-none hover:brightness-110")}
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming && <Loader2 id={`${id}-confirm-spinner`} className={cn(`${id}-confirm-spinner`, "animate-spin")} aria-hidden />}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
