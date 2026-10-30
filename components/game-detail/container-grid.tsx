"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { rarityStyle } from "@/components/game-detail/rarity";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { containerDisplayName, playerApi, type PlayerContainer, type PlayerItem } from "@/lib/player-api";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

const MAX_CELL_REM = 3.5;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/** Items of one container laid out on its grid (each item at grid_x/grid_y spanning its size). */
export function ContainerGrid({ container }: { container: PlayerContainer }) {
  const { t, locale } = useTranslation();
  const [items, setItems] = useState<PlayerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const base = `container-grid-${container.id}`;

  const load = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const result = await playerApi.listMyContainerItems(container.id);
      setItems(result.items ?? []);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [container.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading) {
    return (
      <p id={`${base}-loading`} className="container-grid-loading flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 id={`${base}-loading-icon`} className="container-grid-loading-icon size-4 animate-spin text-primary" aria-hidden />
        {t("common.loading")}
      </p>
    );
  }

  if (hasError) {
    return (
      <div id={`${base}-error`} className="container-grid-error max-w-md space-y-3">
        <FormAlert id={`${base}-error-alert`} tone="error" message={t("gameDetail.itemsLoadFailed")} />
        <Button id={`${base}-retry`} variant="outline" size="sm" onClick={() => void load()}>
          {t("games.retry")}
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p id={`${base}-empty`} className="container-grid-empty text-sm text-muted-foreground">
        {t("gameDetail.containerEmpty")}
      </p>
    );
  }

  const cols = Math.max(container.definition?.grid_cols ?? 1, 1, ...items.map((item) => item.grid_x + (item.definition?.grid_width ?? 1)));
  const rows = Math.max(container.definition?.grid_rows ?? 1, 1, ...items.map((item) => item.grid_y + (item.definition?.grid_height ?? 1)));

  return (
    <div id={base} className="container-grid overflow-x-auto">
      <ul
        id={`${base}-cells`}
        aria-label={containerDisplayName(container)}
        className="container-grid-cells grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(2.25rem, 1fr))`,
          gridTemplateRows: `repeat(${rows}, auto)`,
          maxWidth: `${cols * MAX_CELL_REM}rem`,
        }}
      >
        {Array.from({ length: cols * rows }, (_, index) => (
          <li
            id={`${base}-slot-${index}`}
            key={`slot-${index}`}
            aria-hidden
            className="container-grid-slot aspect-square rounded-sm bg-background/60"
            style={{ gridColumn: (index % cols) + 1, gridRow: Math.floor(index / cols) + 1 }}
          />
        ))}
        {items.map((item) => {
          const name = item.definition?.name ?? item.id.slice(0, 8);
          const width = item.definition?.grid_width ?? 1;
          const height = item.definition?.grid_height ?? 1;
          return (
            <li
              id={`${base}-item-${item.id}`}
              key={item.id}
              title={`${name} × ${item.quantity.toLocaleString(locale)}`}
              className={cn(
                "container-grid-item relative flex items-center justify-center overflow-hidden rounded-sm border text-center font-display text-sm font-bold",
                rarityStyle(item.definition?.rarity),
              )}
              style={{ gridColumn: `${item.grid_x + 1} / span ${width}`, gridRow: `${item.grid_y + 1} / span ${height}` }}
            >
              <span id={`${base}-item-${item.id}-label`} className="container-grid-item-label">{initials(name)}</span>
              <span id={`${base}-item-${item.id}-name`} className="container-grid-item-name sr-only">{name}</span>
              {item.quantity > 1 && (
                <span id={`${base}-item-${item.id}-quantity`} className="container-grid-item-quantity tabular absolute bottom-0.5 right-1 text-[0.625rem] font-semibold text-foreground">
                  {item.quantity.toLocaleString(locale)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
