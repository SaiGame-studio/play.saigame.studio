"use client";

import { ExternalLink, LogOut } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { LanguageSelector } from "@/components/language-selector";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { STUDIO_URL } from "@/lib/config";
import { useTranslation } from "@/lib/i18n/use-translation";

export function AppHeader() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <header id="app-header" className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur">
      <div id="app-header-inner" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <BrandMark id="app-header-brand" />
        <nav id="app-header-nav" className="flex items-center gap-2">
          <LanguageSelector />
          <a id="app-header-studio-link" href={STUDIO_URL} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ExternalLink id="app-header-studio-link-icon" aria-hidden />
            <span id="app-header-studio-link-text" className="hidden sm:inline">
              {t("nav.openStudio")}
            </span>
          </a>
          {user && (
            <Button id="app-header-sign-out" variant="ghost" size="sm" onClick={() => void logout()}>
              <LogOut id="app-header-sign-out-icon" aria-hidden />
              <span id="app-header-sign-out-text" className="hidden sm:inline">
                {t("nav.signOut")}
              </span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
