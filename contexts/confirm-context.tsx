"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { ConfirmDialog, type ConfirmTone } from "@/components/ui/confirm-dialog";
import { useTranslation } from "@/lib/i18n/use-translation";

export interface ConfirmOptions {
  /** Feature-scoped kebab-case id for the dialog elements, e.g. "sign-out-confirm". */
  id: string;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: ConfirmTone;
  /**
   * Optional action run after the user confirms. The dialog stays open with a spinner
   * until it settles, then closes. If it throws, the dialog closes and the error is rethrown.
   */
  onConfirm?: () => Promise<unknown> | unknown;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

/** Hosts the single app-wide confirmation dialog. Mounted once in `Providers`. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const resolverRef = useRef<{ resolve: (value: boolean) => void; reject: (error: unknown) => void } | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (next) =>
      new Promise<boolean>((resolve, reject) => {
        resolverRef.current?.resolve(false); // a newer request replaces any open one
        resolverRef.current = { resolve, reject };
        setOptions(next);
      }),
    [],
  );

  const close = useCallback(() => {
    setOptions(null);
    setIsConfirming(false);
    resolverRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    resolverRef.current?.resolve(false);
    close();
  }, [close]);

  const handleConfirm = useCallback(async () => {
    const resolver = resolverRef.current;
    if (!options || !resolver) return;
    if (!options.onConfirm) {
      resolver.resolve(true);
      close();
      return;
    }
    setIsConfirming(true);
    try {
      await options.onConfirm();
      resolver.resolve(true);
    } catch (error) {
      resolver.reject(error);
    } finally {
      close();
    }
  }, [options, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        id={options?.id ?? "confirm-dialog"}
        open={options !== null}
        title={options?.title ?? ""}
        description={options?.description}
        confirmText={options?.confirmText ?? t("common.confirm")}
        cancelText={options?.cancelText ?? t("common.cancel")}
        tone={options?.tone}
        isConfirming={isConfirming}
        onConfirm={() => void handleConfirm()}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

/**
 * Ask the user to confirm an action. Resolves true when confirmed, false when cancelled.
 * This is the only way Sai Play asks the user for confirmation.
 */
export function useConfirm(): ConfirmFn {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
