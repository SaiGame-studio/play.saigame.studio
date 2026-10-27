"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { useAuth } from "@/contexts/auth-context";
import { GUEST_ONLY_PATHS } from "@/lib/auth-redirect";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Shows a loader until the SSO session check finishes, then renders the page chrome. */
export function SessionGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const { t } = useTranslation();
  const isGuestOnly = GUEST_ONLY_PATHS.includes(pathname);
  const waitingForRedirect = isGuestOnly ? isAuthenticated : !isAuthenticated;

  if (isLoading || waitingForRedirect) {
    return (
      <div id="session-gate-loading" className="flex min-h-dvh items-center justify-center gap-3 text-muted-foreground">
        <Loader2 id="session-gate-loading-icon" className="size-5 animate-spin text-primary" aria-hidden />
        <span id="session-gate-loading-text">{t("common.loading")}</span>
      </div>
    );
  }

  return (
    <div id="app-shell" className="flex min-h-dvh flex-col">
      <AppHeader />
      <main id="app-main" className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
