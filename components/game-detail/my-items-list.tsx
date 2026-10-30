"use client";

import { useState } from "react";
import { Loader2, Package, Search, X } from "lucide-react";
import { ItemRarityBadge } from "@/components/game-detail/item-rarity-badge";
import { useMyItems } from "@/components/game-detail/use-my-items";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Flat list of the player's items in one game, searchable by name. */
export function MyItemsList({ gameId }: { gameId: string }) {
  const { t, locale } = useTranslation();
  const [search, setSearch] = useState("");
  const { items, total, hasMore, isFiltered, isLoading, isLoadingMore, hasError, loadMore, retry } = useMyItems(gameId, search);

  return (
    <section id="my-items-list" aria-labelledby="my-items-list-title" className="my-items-list space-y-4">
      <div id="my-items-list-toolbar" className="my-items-list-toolbar flex flex-wrap items-center justify-between gap-3">
        <h2 id="my-items-list-title" className="my-items-list-title text-sm text-muted-foreground">
          {isLoading ? t("common.loading") : t("gameDetail.itemCount", { count: total.toLocaleString(locale) })}
        </h2>
        <div id="my-items-search" className="my-items-search relative w-full sm:w-64">
          <Search id="my-items-search-icon" className="my-items-search-icon pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            id="my-items-search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("gameDetail.searchItems")}
            aria-label={t("gameDetail.searchItems")}
            className="my-items-search-input h-10 w-full rounded-md border border-input bg-card pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {search && (
            <button
              id="my-items-search-clear"
              type="button"
              onClick={() => setSearch("")}
              aria-label={t("gameDetail.clearSearch")}
              className="my-items-search-clear absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            >
              <X id="my-items-search-clear-icon" className="my-items-search-clear-icon size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div id="my-items-loading" role="status" aria-label={t("common.loading")} className="my-items-loading space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div id={`my-items-loading-row-${index}`} key={index} className="my-items-loading-row h-12 animate-pulse rounded-md bg-card" />
          ))}
        </div>
      ) : hasError && items.length === 0 ? (
        <div id="my-items-error" className="my-items-error max-w-md space-y-3">
          <FormAlert id="my-items-error-alert" tone="error" message={t("gameDetail.itemsLoadFailed")} />
          <Button id="my-items-retry" variant="outline" size="sm" onClick={() => void retry()}>
            {t("games.retry")}
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div id="my-items-empty" className="my-items-empty flex flex-col items-center rounded-md border border-dashed border-border px-6 py-14 text-center">
          <Package id="my-items-empty-icon" className="my-items-empty-icon mb-3 size-10 text-muted-foreground" aria-hidden />
          <p id="my-items-empty-text" className="my-items-empty-text text-muted-foreground">
            {isFiltered ? t("gameDetail.noMatchingItems") : t("gameDetail.noItems")}
          </p>
        </div>
      ) : (
        <>
          <div id="my-items-table-wrap" className="my-items-table-wrap overflow-x-auto rounded-md border border-border">
            <table id="my-items-table" className="my-items-table w-full text-sm">
              <thead id="my-items-table-head" className="my-items-table-head bg-card text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <tr id="my-items-table-head-row" className="my-items-table-head-row">
                  <th id="my-items-col-name" scope="col" className="my-items-col px-4 py-3 font-medium">{t("gameDetail.colItem")}</th>
                  <th id="my-items-col-category" scope="col" className="my-items-col hidden px-4 py-3 font-medium md:table-cell">{t("gameDetail.colCategory")}</th>
                  <th id="my-items-col-rarity" scope="col" className="my-items-col px-4 py-3 font-medium">{t("gameDetail.colRarity")}</th>
                  <th id="my-items-col-quantity" scope="col" className="my-items-col px-4 py-3 text-right font-medium">{t("gameDetail.colQuantity")}</th>
                  <th id="my-items-col-level" scope="col" className="my-items-col hidden px-4 py-3 text-right font-medium sm:table-cell">{t("gameDetail.colLevel")}</th>
                  <th id="my-items-col-acquired" scope="col" className="my-items-col hidden px-4 py-3 font-medium lg:table-cell">{t("gameDetail.colAcquired")}</th>
                </tr>
              </thead>
              <tbody id="my-items-table-body" className="my-items-table-body divide-y divide-border">
                {items.map((item) => {
                  const id = `my-item-${item.id}`;
                  return (
                    <tr id={id} key={item.id} className="my-item">
                      <td id={`${id}-name`} className="my-item-name px-4 py-3">
                        <span id={`${id}-name-text`} className="my-item-name-text block font-medium">{item.definition?.name ?? item.id.slice(0, 8)}</span>
                        {item.equipped_slot_key && (
                          <span id={`${id}-equipped`} className="my-item-equipped text-xs text-primary">{t("gameDetail.equipped")}</span>
                        )}
                      </td>
                      <td id={`${id}-category`} className="my-item-category hidden px-4 py-3 capitalize text-muted-foreground md:table-cell">{item.definition?.category ?? "—"}</td>
                      <td id={`${id}-rarity`} className="my-item-rarity px-4 py-3">
                        <ItemRarityBadge id={`${id}-rarity-badge`} rarity={item.definition?.rarity} />
                      </td>
                      <td id={`${id}-quantity`} className="my-item-quantity tabular px-4 py-3 text-right">{item.quantity.toLocaleString(locale)}</td>
                      <td id={`${id}-level`} className="my-item-level tabular hidden px-4 py-3 text-right text-accent sm:table-cell">{item.level}</td>
                      <td id={`${id}-acquired`} className="my-item-acquired hidden px-4 py-3 text-muted-foreground lg:table-cell">
                        {new Date(item.acquired_at).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {hasError && <FormAlert id="my-items-more-error" tone="error" message={t("gameDetail.itemsLoadFailed")} />}
          {hasMore && (
            <div id="my-items-more" className="my-items-more flex justify-center">
              <Button id="my-items-load-more" variant="outline" onClick={() => void loadMore()} disabled={isLoadingMore}>
                {isLoadingMore && <Loader2 id="my-items-load-more-icon" className="my-items-load-more-icon animate-spin" aria-hidden />}
                {isLoadingMore ? t("common.loading") : t("games.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
