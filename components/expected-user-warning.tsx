"use client";

import { usePathname } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useConfirm } from "@/contexts/confirm-context";
import { useTranslation } from "@/lib/i18n/use-translation";
import { maskEmail } from "@/lib/utils";

interface ExpectedUserWarningProps {
  expectedUserId: string | null;
  onDismiss: () => void;
}

/** Warns when the game that opened this tab is signed in to a different account than the web session. */
export function ExpectedUserWarning({ expectedUserId, onDismiss }: ExpectedUserWarningProps) {
  const { user, relogin } = useAuth();
  const pathname = usePathname();
  const confirm = useConfirm();
  const { t } = useTranslation();

  if (!user || !expectedUserId || user.id.toLowerCase() === expectedUserId) return null;

  const name = user.display_name || user.username;

  const requestRelogin = () => {
    void confirm({
      id: "expected-user-relogin-confirm",
      title: t("nav.signOutConfirmTitle"),
      description: t("nav.signOutConfirmBody"),
      confirmText: t("nav.signOut"),
      tone: "danger",
      // POST /api/v1/auth/logout, then the login page returns here to compare the accounts again.
      onConfirm: () => relogin(`${pathname}${window.location.search}`),
    });
  };

  return (
    <div id="expected-user-warning" role="alert" className="expected-user-warning border-b border-destructive/40 bg-destructive/10">
      <div id="expected-user-warning-inner" className="expected-user-warning-inner mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
        <TriangleAlert id="expected-user-warning-icon" className="expected-user-warning-icon size-5 shrink-0 text-destructive" aria-hidden />
        <div id="expected-user-warning-text" className="expected-user-warning-text flex-1 text-sm">
          <p id="expected-user-warning-title" className="expected-user-warning-title font-semibold text-destructive">
            {t("expectedUser.title")}
          </p>
          <p id="expected-user-warning-body" className="expected-user-warning-body text-muted-foreground">
            {t("expectedUser.body", { name, email: maskEmail(user.email) })}
          </p>
        </div>
        <div id="expected-user-warning-actions" className="expected-user-warning-actions flex shrink-0 gap-2">
          <Button id="expected-user-warning-relogin" className="expected-user-warning-relogin" size="sm" onClick={requestRelogin}>
            {t("expectedUser.relogin")}
          </Button>
          <Button id="expected-user-warning-dismiss" className="expected-user-warning-dismiss" size="sm" variant="ghost" onClick={onDismiss}>
            {t("expectedUser.dismiss")}
          </Button>
        </div>
      </div>
    </div>
  );
}
