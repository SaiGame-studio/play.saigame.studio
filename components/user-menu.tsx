"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useConfirm } from "@/contexts/confirm-context";
import { STUDIO_URL } from "@/lib/config";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

// Small delay so the pointer can travel from the icon into the menu without it closing.
const CLOSE_DELAY_MS = 150;

const itemClass = "user-menu-item flex w-full items-center gap-2.5 rounded px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none";

/** User icon that opens (hover, click or keyboard) a menu: My account, Open Studio, Sign out. */
export function UserMenu() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const confirm = useConfirm();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const open = () => {
    cancelClose();
    setIsOpen(true);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => cancelClose, []);

  const requestSignOut = () => {
    setIsOpen(false);
    void confirm({
      id: "sign-out-confirm",
      title: t("nav.signOutConfirmTitle"),
      description: t("nav.signOutConfirmBody"),
      confirmText: t("nav.signOut"),
      tone: "danger",
      // POST /api/v1/auth/logout: revokes the current access token and clears the shared SSO cookie.
      onConfirm: logout,
    });
  };

  if (!user) return null;

  return (
    <div id="user-menu" ref={rootRef} className="user-menu relative" onMouseEnter={open} onMouseLeave={scheduleClose}>
      <button
        id="user-menu-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t("nav.account")}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        className={cn("user-menu-trigger flex size-9 items-center justify-center rounded-md hover:bg-muted", isOpen && "bg-muted")}
      >
        <UserRound id="user-menu-trigger-icon" className="user-menu-trigger-icon size-4" aria-hidden />
      </button>
      {isOpen && (
        <div
          id="user-menu-panel"
          role="menu"
          aria-labelledby="user-menu-trigger"
          className="user-menu-panel absolute right-0 top-full z-30 pt-1"
        >
          <div id="user-menu-panel-inner" className="user-menu-panel-inner min-w-[13rem] rounded-md border border-border bg-card p-1 shadow-xl shadow-black/40">
            <div id="user-menu-identity" className="user-menu-identity border-b border-border px-3 pb-2 pt-1.5">
              <p id="user-menu-identity-name" className="user-menu-identity-name truncate text-sm font-semibold">
                {user.display_name || user.username}
              </p>
              <p id="user-menu-identity-email" className="user-menu-identity-email truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            <div id="user-menu-items" className="user-menu-items pt-1">
              <Link id="user-menu-item-account" role="menuitem" href="/account" className={itemClass} onClick={() => setIsOpen(false)}>
                <UserRound id="user-menu-item-account-icon" className="user-menu-item-icon size-4 text-muted-foreground" aria-hidden />
                {t("nav.myAccount")}
              </Link>
              <a id="user-menu-item-studio" role="menuitem" href={STUDIO_URL} className={itemClass}>
                <ExternalLink id="user-menu-item-studio-icon" className="user-menu-item-icon size-4 text-muted-foreground" aria-hidden />
                {t("nav.openStudio")}
              </a>
              <div id="user-menu-separator" role="separator" className="user-menu-separator my-1 h-px bg-border" />
              <button
                id="user-menu-item-sign-out"
                type="button"
                role="menuitem"
                className={cn(itemClass, "text-destructive")}
                onClick={requestSignOut}
              >
                <LogOut id="user-menu-item-sign-out-icon" className="user-menu-item-icon size-4" aria-hidden />
                {t("nav.signOut")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
