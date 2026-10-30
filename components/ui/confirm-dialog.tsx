"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmTone = "default" | "danger";

export interface ConfirmDialogProps {
  id: string;
  open: boolean;
  title: string;
  description?: string;
  confirmText: string;
  cancelText: string;
  tone?: ConfirmTone;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Centered confirmation dialog with its own dim layer, rendered into document.body so no
 * ancestor (sticky header, transforms, backdrop-filter) can clip or offset it.
 * Prefer `useConfirm()` from `@/contexts/confirm-context`; render this directly only when
 * a screen needs custom control over the open state.
 */
export function ConfirmDialog({
  id,
  open,
  title,
  description,
  confirmText,
  cancelText,
  tone = "default",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isMounted, setIsMounted] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isConfirming) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, isConfirming, onCancel]);

  if (!open || !isMounted) return null;

  return createPortal(
    <div id={id} className={cn("confirm-dialog", "fixed inset-0 z-[100] flex items-center justify-center p-4")}>
      <div
        id={`${id}-dim`}
        aria-hidden
        className={cn("confirm-dialog-dim", "absolute inset-0 bg-black/70 backdrop-blur-sm")}
        onClick={() => !isConfirming && onCancel()}
      />
      <div
        id={`${id}-panel`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-description` : undefined}
        className={cn("confirm-dialog-panel", "relative w-full max-w-sm rounded-md border border-border bg-card p-6 shadow-2xl shadow-black/60")}
      >
        <h2 id={`${id}-title`} className={cn("confirm-dialog-title", "font-display text-lg font-semibold")}>
          {title}
        </h2>
        {description && (
          <p id={`${id}-description`} className={cn("confirm-dialog-description", "mt-2 text-sm text-muted-foreground")}>
            {description}
          </p>
        )}
        <div id={`${id}-actions`} className={cn("confirm-dialog-actions", "mt-6 flex justify-end gap-2")}>
          <Button id={`${id}-cancel`} ref={cancelRef} variant="ghost" className="confirm-dialog-cancel" onClick={onCancel} disabled={isConfirming}>
            {cancelText}
          </Button>
          <Button
            id={`${id}-confirm`}
            className={cn("confirm-dialog-confirm", tone === "danger" && "bg-destructive text-white shadow-none hover:brightness-110")}
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming && <Loader2 id={`${id}-confirm-spinner`} className="confirm-dialog-confirm-spinner animate-spin" aria-hidden />}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
