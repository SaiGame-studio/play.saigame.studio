"use client";

import { useState } from "react";
import { Boxes, ChevronDown, Loader2 } from "lucide-react";
import { ContainerGrid } from "@/components/game-detail/container-grid";
import { useMyContainers } from "@/components/game-detail/use-my-containers";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { containerDisplayName } from "@/lib/player-api";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

/** The player's containers in one game; each expands to show its items on the container grid. */
export function MyContainersView({ gameId }: { gameId: string }) {
  const { t } = useTranslation();
  const { containers, hasMore, isLoading, isLoadingMore, hasError, loadMore, retry } = useMyContainers(gameId);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (containerId: string) => {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(containerId)) next.delete(containerId);
      else next.add(containerId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div id="my-containers-loading" role="status" aria-label={t("common.loading")} className="my-containers-loading space-y-2">
        {Array.from({ length: 3 }, (_, index) => (
          <div id={`my-containers-loading-row-${index}`} key={index} className="my-containers-loading-row h-14 animate-pulse rounded-md bg-card" />
        ))}
      </div>
    );
  }

  if (hasError && containers.length === 0) {
    return (
      <div id="my-containers-error" className="my-containers-error max-w-md space-y-3">
        <FormAlert id="my-containers-error-alert" tone="error" message={t("gameDetail.containersLoadFailed")} />
        <Button id="my-containers-retry" variant="outline" size="sm" onClick={() => void retry()}>
          {t("games.retry")}
        </Button>
      </div>
    );
  }

  if (containers.length === 0) {
    return (
      <div id="my-containers-empty" className="my-containers-empty flex flex-col items-center rounded-md border border-dashed border-border px-6 py-14 text-center">
        <Boxes id="my-containers-empty-icon" className="my-containers-empty-icon mb-3 size-10 text-muted-foreground" aria-hidden />
        <p id="my-containers-empty-text" className="my-containers-empty-text text-muted-foreground">{t("gameDetail.noContainers")}</p>
      </div>
    );
  }

  return (
    <section id="my-containers" className="my-containers space-y-3">
      <ul id="my-containers-list" className="my-containers-list space-y-3">
        {containers.map((container) => {
          const id = `my-container-${container.id}`;
          const isOpen = openIds.has(container.id);
          return (
            <li id={id} key={container.id} className="my-container overflow-hidden rounded-md border border-border bg-card">
              <button
                id={`${id}-toggle`}
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id}-body`}
                onClick={() => toggle(container.id)}
                className="my-container-toggle flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-muted/50"
              >
                <span id={`${id}-heading`} className="my-container-heading min-w-0">
                  <span id={`${id}-name`} className="my-container-name block truncate font-display text-lg font-semibold uppercase leading-tight">
                    {containerDisplayName(container)}
                  </span>
                  <span id={`${id}-meta`} className="my-container-meta block text-xs capitalize text-muted-foreground">
                    {container.container_type.replace(/_/g, " ")}
                    {container.definition && ` · ${container.definition.grid_cols} × ${container.definition.grid_rows}`}
                  </span>
                </span>
                <ChevronDown id={`${id}-chevron`} className={cn("my-container-chevron size-5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} aria-hidden />
              </button>
              {isOpen && (
                <div id={`${id}-body`} className="my-container-body border-t border-border p-4">
                  <ContainerGrid container={container} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {hasError && <FormAlert id="my-containers-more-error" tone="error" message={t("gameDetail.containersLoadFailed")} />}
      {hasMore && (
        <div id="my-containers-more" className="my-containers-more flex justify-center pt-3">
          <Button id="my-containers-load-more" variant="outline" onClick={() => void loadMore()} disabled={isLoadingMore}>
            {isLoadingMore && <Loader2 id="my-containers-load-more-icon" className="my-containers-load-more-icon animate-spin" aria-hidden />}
            {isLoadingMore ? t("common.loading") : t("games.loadMore")}
          </Button>
        </div>
      )}
    </section>
  );
}
