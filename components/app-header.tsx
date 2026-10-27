"use client";

import { BrandMark } from "@/components/brand-mark";
import { LanguageSelector } from "@/components/language-selector";
import { MainNav } from "@/components/main-nav";
import { SgemBalance } from "@/components/sgem/sgem-balance";
import { UserMenu } from "@/components/user-menu";
import { useAuth } from "@/contexts/auth-context";

export function AppHeader() {
  const { user } = useAuth();

  return (
    <header id="app-header" className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur">
      <div id="app-header-inner" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <div id="app-header-start" className="app-header-start flex items-center gap-4 md:gap-6">
          <BrandMark id="app-header-brand" />
          {user && <MainNav />}
        </div>
        <nav id="app-header-nav" className="flex items-center gap-2">
          {user && <SgemBalance />}
          <div id="app-header-language" className="hidden sm:block">
            <LanguageSelector />
          </div>
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
