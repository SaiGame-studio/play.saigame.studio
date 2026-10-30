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
    <header id="app-header" className="app-header sticky top-0 z-20 border-b border-border bg-background">
      <div id="app-header-inner" className="app-header-inner mx-auto flex h-16 max-w-6xl items-stretch justify-between gap-3 px-4">
        <div id="app-header-start" className="app-header-start flex items-stretch gap-4 md:gap-8">
          <BrandMark id="app-header-brand" />
          {user && <MainNav />}
        </div>
        <nav id="app-header-nav" className="app-header-nav flex items-center gap-2">
          {user && <SgemBalance />}
          <div id="app-header-language" className="app-header-language hidden sm:block">
            <LanguageSelector />
          </div>
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
