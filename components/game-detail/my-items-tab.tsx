"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MyContainersView } from "@/components/game-detail/my-containers-view";
import { MyItemsList } from "@/components/game-detail/my-items-list";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

const VIEWS = [
  { key: "items", labelKey: "gameDetail.viewItems" },
  { key: "containers", labelKey: "gameDetail.viewContainers" },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

/** My Items tab: the player's inventory as a flat item list or grouped by container (kept in ?view=). */
export function MyItemsTab({ gameId }: { gameId: string }) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const view: ViewKey = searchParams.get("view") === "containers" ? "containers" : "items";

  const selectView = (next: ViewKey) => {
    const params = new URLSearchParams({ tab: "items" });
    if (next === "containers") params.set("view", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div id="my-items" className="my-items space-y-6">
      <div id="my-items-views" role="group" aria-label={t("gameDetail.tabItems")} className="my-items-views inline-flex rounded-md border border-border bg-card p-1">
        {VIEWS.map(({ key, labelKey }) => (
          <button
            id={`my-items-view-${key}`}
            key={key}
            type="button"
            aria-pressed={view === key}
            onClick={() => selectView(key)}
            className={cn(
              "my-items-view rounded px-3 py-1.5 font-display text-sm font-semibold uppercase tracking-[0.06em] transition-colors",
              view === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
      {view === "items" ? <MyItemsList gameId={gameId} /> : <MyContainersView gameId={gameId} />}
    </div>
  );
}
