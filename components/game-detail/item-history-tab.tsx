"use client";

import { History } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

/*
 * DEV NOTE: placeholder only. Not shown to players.
 *
 * Goal: list the signed-in player's inventory audit trail (table inventory_transactions) for this game.
 *
 * Backend (already exists, nothing calls it yet):
 *   GET /api/v1/games/{game_id}/transactions?limit=50&offset=0&type=grant
 *   - JWT required; always returns the CALLER's own rows (user_id comes from the token).
 *   - limit defaults to 50, capped at 200. type is optional:
 *     grant | consume | removed | moved | equip | unequip | item_generator_collect
 *   - Response: { transactions: Tx[], total, limit, offset }
 *     Tx = { id, game_id, user_id, transaction_type, inventory_item_id?, item_definition_id,
 *            quantity_delta, reason, metadata, created_at }
 *   Code: ss-go/internal/handler/transaction_handler.go, ss-go/internal/domain/inventory_transaction.go
 *
 * To do when building this tab:
 *   1. Add an API module (e.g. lib/item-history-api.ts) and a hook with pagination + type filter.
 *   2. Rows carry only item_definition_id: resolve item names/rarity the same way My Items does.
 *   3. Map `reason` to translated labels. Known values: quest_reward, quest_submit:<questId>, gacha_reward,
 *      gacha_key_consume, shop_purchase, mailbox_claim, player_gift_send, craft_consume, generator_collect,
 *      api_key_grant, lua_script:<name>, server_script_adjust_qty, client_adjust_qty, service_grant,
 *      steam_ownership_reward, move, split_move, stack_merge, swap, place_shulker_box, pickup_shulker_box.
 *      Fall back to the raw value for unknown reasons.
 *   4. Decide with product whether "moved" rows (quantity_delta = 0) are shown; they are noise for most players.
 *
 * Known backend gaps to raise first:
 *   - Crafting output grants are written with an empty reason (ss-go local_crafting_service.go).
 *   - equip / unequip / item_generator_collect are never written today.
 *   - Non-stackable grants write one row per unit, so a 100-unit grant shows as 100 rows.
 *   - The list runs COUNT(*) on every page; may need a cursor if histories get long.
 */
export function ItemHistoryTab() {
  const { t } = useTranslation();

  return (
    <div id="item-history-coming-soon" className="item-history-coming-soon flex flex-col items-center rounded-md border border-dashed border-border px-6 py-14 text-center">
      <History id="item-history-coming-soon-icon" className="item-history-coming-soon-icon mb-3 size-10 text-muted-foreground" aria-hidden />
      <p id="item-history-coming-soon-title" className="item-history-coming-soon-title font-display text-lg font-semibold uppercase tracking-[0.06em]">
        {t("gameDetail.historyComingSoon")}
      </p>
      <p id="item-history-coming-soon-text" className="item-history-coming-soon-text mt-1 text-sm text-muted-foreground">
        {t("gameDetail.historyComingSoonText")}
      </p>
    </div>
  );
}
