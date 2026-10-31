import { api } from "@/lib/api-client";
import { newIdempotencyKey } from "@/lib/sgem-api";

/*
 * In-game shops: the game-client endpoints ss-unity uses (JWT; purchases are the caller's own).
 * Only shops the Studio marked "Show in Sai Play" are listed here.
 */

export type ShopType = "permanent" | "event";
export type ShopCurrencyType = "item" | "sgem";
export type ShopCollectDestination = "mailbox" | "inventory";
export type PurchaseLimitType = "unlimited" | "player" | "global";
export type RestockSchedule = "none" | "daily" | "weekly" | "monthly";

export interface GameShop {
  id: string;
  game_id: string;
  shop_key: string;
  name: string;
  description: string;
  shop_type: ShopType;
  /** ISO timestamp; event shops only. */
  starts_at?: string;
  /** ISO timestamp; event shops only. */
  ends_at?: string;
  collect_destination: ShopCollectDestination;
  show_in_sai_play?: boolean;
  item_count: number;
}

/** GET /api/v1/games/{game_id}/shops */
interface GameShopsPage {
  shops: GameShop[] | null;
  total: number;
  limit: number;
  offset: number;
}

export interface ShopCurrency {
  item_def_id: string;
  item_code: string;
  item_name: string;
}

export interface ShopListing {
  id: string;
  shop_id: string;
  item_def_id: string;
  display_name: string;
  description: string;
  price: number;
  payment_currency_type: ShopCurrencyType;
  /** Inventory item paid with; absent for sGem and the legacy coin wallet. */
  currency?: ShopCurrency | null;
  purchase_limit_type: PurchaseLimitType;
  purchase_limit: number;
  restock_schedule: RestockSchedule;
  stock: number;
  sort_order: number;
  /** The signed-in player's purchases in the current restock window. */
  purchased_count?: number;
}

/** GET /api/v1/games/{game_id}/shops/{shop_id}/items */
export interface ShopListingsResponse {
  shop_id: string;
  item_count: number;
  items: ShopListing[] | null;
}

/** POST /api/v1/games/{game_id}/shops/{shop_id}/purchase */
export interface ShopPurchaseResult {
  purchase_record: { id: string; quantity: number; total_price: number; currency_type: ShopCurrencyType };
  collect_destination: ShopCollectDestination;
}

const SHOPS_PAGE_SIZE = 50;

function gamePath(gameId: string) {
  return `/api/v1/games/${encodeURIComponent(gameId)}`;
}

export const shopApi = {
  /** All open shops of the game that are shown in Sai Play. */
  listSaiPlayShops: async (gameId: string) => {
    const shops: GameShop[] = [];
    for (let offset = 0; ; offset += SHOPS_PAGE_SIZE) {
      const params = new URLSearchParams({ limit: String(SHOPS_PAGE_SIZE), offset: String(offset) });
      const page = await api.get<GameShopsPage>(`${gamePath(gameId)}/shops?${params.toString()}`);
      const batch = page.shops ?? [];
      shops.push(...batch);
      if (batch.length === 0 || offset + batch.length >= page.total) break;
    }
    return shops.filter((shop) => shop.show_in_sai_play);
  },
  listItems: (gameId: string, shopId: string) =>
    api.get<ShopListingsResponse>(`${gamePath(gameId)}/shops/${encodeURIComponent(shopId)}/items`),
  purchase: (gameId: string, shopId: string, shopItemId: string, quantity: number) =>
    api.post<ShopPurchaseResult>(`${gamePath(gameId)}/shops/${encodeURIComponent(shopId)}/purchase`, {
      shop_item_id: shopItemId,
      quantity,
      idempotency_key: newIdempotencyKey(),
    }),
};

/** Units the player may still buy, or null when no per-player cap applies. */
export function remainingForPlayer(item: ShopListing): number | null {
  if (item.purchase_limit_type !== "player" || item.purchase_limit <= 0) return null;
  return Math.max(0, item.purchase_limit - (item.purchased_count ?? 0));
}
