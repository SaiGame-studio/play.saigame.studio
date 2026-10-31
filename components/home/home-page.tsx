"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PlayedGames } from "@/components/games/played-games";
import { PublicGames } from "@/components/games/public-games";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "my-games", href: "/", labelKey: "home.tabMyGames" },
  { key: "discover", href: "/?tab=discover", labelKey: "publicGames.title" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/** Home: two link tabs, My games (signed in only) and Discover games; the tab is kept in ?tab=. Guests only see Discover. */
export function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const tab: TabKey = !isAuthenticated || searchParams.get("tab") === "discover" ? "discover" : "my-games";
  const name = user?.display_name || user?.username || "";

  return (
    <div id="home" className="home flex flex-1 flex-col">
      <div id="home-header" className="home-header mx-auto w-full max-w-6xl px-4 pt-10 sm:pt-12">
        <div id="home-tabs-row" className="home-tabs-row flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border">
          <nav id="home-tabs" aria-label={t("nav.main")} className="home-tabs flex gap-6">
            {TABS.filter(({ key }) => isAuthenticated || key === "discover").map(({ key, href, labelKey }) => {
              const active = tab === key;
              return (
                <Link
                  id={`home-tab-${key}`}
                  key={key}
                  href={href}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "home-tab relative pb-3 font-display text-3xl font-extrabold uppercase leading-none transition-colors sm:text-4xl",
                    "after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:bg-primary after:transition-transform after:duration-200",
                    active ? "text-foreground after:scale-x-100" : "text-muted-foreground after:scale-x-0 hover:text-foreground",
                  )}
                >
                  {t(labelKey)}
                </Link>
              );
            })}
          </nav>
          {isAuthenticated && (
            <p id="home-greeting" className="home-greeting pb-3 text-sm text-muted-foreground">
              {t("home.greeting", { name })}
            </p>
          )}
        </div>
      </div>
      {tab === "my-games" ? <PlayedGames /> : <PublicGames />}
    </div>
  );
}
