"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { TwoFactorProofInput } from "@/components/auth/two-factor-proof-input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormAlert } from "@/components/ui/form-alert";
import { ApiError } from "@/lib/api-client";
import { useTranslation } from "@/lib/i18n/use-translation";
import { playerApi } from "@/lib/player-api";
import { factorProof, twoFactorApi, twoFactorErrorKey, validFactorProof } from "@/lib/two-factor-api";

/**
 * Deletes the player's gamer progress in a game after confirmation. When the account has 2FA enabled the
 * dialog also asks for an Authenticator or recovery code; the backend always requires it for this action.
 */
export function DeleteGamerProgress({ gameId, onDeleted }: { gameId: string; onDeleted: () => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [lockedUntil, setLockedUntil] = useState(0);
  const submitting = useRef(false);
  const locked = lockedUntil > Date.now();

  useEffect(() => {
    if (!lockedUntil) return;
    const timer = setTimeout(() => setLockedUntil(0), Math.max(0, lockedUntil - Date.now()));
    return () => clearTimeout(timer);
  }, [lockedUntil]);

  const openDialog = async () => {
    setIsChecking(true);
    setError("");
    setCode("");
    setRecovery(false);
    try {
      const status = await twoFactorApi.status();
      setTwoFactorEnabled(status.enabled);
      setOpen(true);
    } catch (err) {
      setError(t(twoFactorErrorKey(err)));
    } finally {
      setIsChecking(false);
    }
  };

  const closeDialog = () => {
    if (isDeleting) return;
    setOpen(false);
    setError("");
  };

  const submit = async (value: string) => {
    if (submitting.current || locked) return;
    if (twoFactorEnabled && !validFactorProof(value, recovery)) return;
    submitting.current = true;
    setIsDeleting(true);
    setError("");
    try {
      await playerApi.deleteMyGamerProgress(gameId, twoFactorEnabled ? factorProof(value, recovery) : undefined);
      setOpen(false);
      onDeleted();
    } catch (err) {
      const messageCode = err instanceof ApiError ? err.code : undefined;
      if (messageCode === "TWO_FACTOR_REQUIRED") setTwoFactorEnabled(true);
      if (err instanceof ApiError && (err.status === 429 || messageCode === "TWO_FACTOR_RATE_LIMITED")) {
        const seconds = Number((err.data as { retry_after?: number } | undefined)?.retry_after);
        setLockedUntil(Date.now() + (Number.isFinite(seconds) && seconds > 0 ? seconds : 300) * 1000);
      }
      setError(messageCode?.startsWith("TWO_FACTOR_") ? t(twoFactorErrorKey(err)) : t("gameDetail.deleteProgressFailed"));
    } finally {
      submitting.current = false;
      setIsDeleting(false);
    }
  };

  return (
    <div id="delete-gamer-progress" className="delete-gamer-progress space-y-2">
      <Button
        id="delete-gamer-progress-button"
        className="delete-gamer-progress-button border-destructive/60 text-destructive hover:border-destructive hover:text-destructive"
        variant="outline"
        size="sm"
        disabled={isChecking}
        onClick={() => void openDialog()}
      >
        {isChecking && <Loader2 id="delete-gamer-progress-button-spinner" className="delete-gamer-progress-button-spinner animate-spin" aria-hidden />}
        {t("gameDetail.deleteProgress")}
      </Button>
      {!open && error && <FormAlert id="delete-gamer-progress-error" tone="error" message={error} />}
      <ConfirmDialog
        id="delete-gamer-progress-confirm"
        open={open}
        title={t("gameDetail.deleteProgressTitle")}
        description={t("gameDetail.deleteProgressDescription")}
        confirmText={t("gameDetail.deleteProgressConfirm")}
        cancelText={t("common.cancel")}
        tone="danger"
        isConfirming={isDeleting}
        confirmDisabled={locked || (twoFactorEnabled && !validFactorProof(code, recovery))}
        onConfirm={() => void submit(code)}
        onCancel={closeDialog}
        actionsMessage={
          error ? (
            <p
              id="delete-gamer-progress-confirm-error"
              role="alert"
              title={error}
              className="delete-gamer-progress-confirm-error flex items-start gap-1.5 text-xs leading-4 text-destructive"
            >
              <AlertCircle id="delete-gamer-progress-confirm-error-icon" className="delete-gamer-progress-confirm-error-icon size-4 shrink-0" aria-hidden />
              <span id="delete-gamer-progress-confirm-error-text" className="delete-gamer-progress-confirm-error-text line-clamp-2">
                {error}
              </span>
            </p>
          ) : null
        }
      >
        {twoFactorEnabled ? (
          <TwoFactorProofInput
            id="delete-gamer-progress-proof"
            value={code}
            onChange={setCode}
            recovery={recovery}
            onRecoveryChange={setRecovery}
            disabled={locked}
            onComplete={(value) => void submit(value)}
          />
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
