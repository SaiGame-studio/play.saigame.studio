"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House } from "lucide-react";
import type { ReactNode } from "react";
import { SgemIcon } from "@/components/sgem/sgem-icon";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    key: "home",
    href: "/",
    labelKey: "nav.home",
    icon: (id: string): ReactNode => <House id={id} className="main-nav-item-icon size-4" aria-hidden />,
  },
  {
    key: "buy-sgem",
    href: "/sgem",
    labelKey: "sgem.buy",
    icon: (id: string): ReactNode => <SgemIcon id={id} className="main-nav-item-icon text-sm leading-none" />,
  },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Primary header menu: Home (the player's games) and Buy sGem. */
export function MainNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav id="main-nav" aria-label={t("nav.main")} className="main-nav flex items-stretch gap-1 md:gap-2">
      {NAV_ITEMS.map(({ key, href, labelKey, icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            id={`main-nav-item-${key}`}
            key={key}
            href={href}
            title={t(labelKey)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "main-nav-item relative flex items-center gap-2 px-2.5 font-display text-base font-semibold uppercase tracking-[0.08em] transition-colors md:px-3",
              "after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:bg-primary after:transition-transform after:duration-200",
              active ? "text-foreground after:scale-x-100" : "text-muted-foreground after:scale-x-0 hover:text-foreground",
            )}
          >
            {icon(`main-nav-item-${key}-icon`)}
            <span id={`main-nav-item-${key}-label`} className="main-nav-item-label hidden md:inline">
              {t(labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
