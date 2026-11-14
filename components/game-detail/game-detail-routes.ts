import { gameDetailHref } from "@/components/games/game-switcher";

export type GameDetailTab = "detail" | "items" | "history" | "shops";

/** Friendly URL of a game tab: /games/{gameId} for Detail, /games/{gameId}/{tab} otherwise. */
export function gameTabHref(gameId: string, tab: GameDetailTab) {
  const base = gameDetailHref(gameId);
  return tab === "detail" ? base : `${base}/${tab}`;
}

/** Friendly URL of a shop: /games/{gameId}/shops/{shopId}. */
export function gameShopHref(gameId: string, shopId: string) {
  return `${gameTabHref(gameId, "shops")}/${encodeURIComponent(shopId)}`;
}
