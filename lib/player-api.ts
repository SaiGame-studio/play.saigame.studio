import { api } from "@/lib/api-client";

/** Player API (ss-go /api/v1/player/*): only the signed-in player's own data. */

export interface PlayedGame {
  game_id: string;
  game_name: string;
  /** Game image from the Studio's game public info; null when none is set. */
  image_url: string | null;
  level: number;
  experience: number;
  is_banned: boolean;
  /** Unix seconds. */
  first_played_at: number;
  /** Unix seconds. */
  last_played_at: number;
}

export interface PlayedGamesPage {
  games: PlayedGame[];
  next_cursor: string | null;
}

/**
 * GET /api/v1/games/{game_id}/my-gamer-progress (the endpoint ss-unity uses).
 * `{}` when the player has no gamer profile in the game; 403 when the profile is banned.
 */
export interface MyGamerProgress {
  id?: string;
  level?: number;
  experience?: number;
}

/*
 * Inventory: the game-client endpoints ss-unity uses (JWT; the caller's own data).
 * They go through the backend's CCU middleware, so viewing them counts as an active session.
 */

export interface PlayerItemDefinition {
  id: string;
  item_code: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  grid_width: number;
  grid_height: number;
}

export interface PlayerItem {
  id: string;
  item_container_id: string;
  grid_x: number;
  grid_y: number;
  quantity: number;
  level: number;
  public_properties: Record<string, unknown> | null;
  equipped_slot_key?: string | null;
  /** ISO timestamp. */
  acquired_at: string;
  definition?: PlayerItemDefinition | null;
}

/** GET /api/v1/games/{game_id}/inventory */
export interface PlayerItemsPage {
  items: PlayerItem[];
  total: number;
  /** Id of the last item; pass back as `after`. Present whenever the page is non-empty. */
  next_after?: string;
}

export interface PlayerContainer {
  id: string;
  container_type: string;
  /** Custom display name; falls back to the definition name. */
  name?: string | null;
  definition?: { name: string; grid_cols: number; grid_rows: number } | null;
}

/** GET /api/v1/games/{game_id}/containers */
export interface PlayerContainersPage {
  containers: PlayerContainer[] | null;
  limit: number;
  offset: number;
  has_more: boolean;
}

/** GET /api/v1/containers/{container_id}/items */
export interface PlayerContainerItems {
  container_id: string;
  items: PlayerItem[] | null;
}

export const PLAYED_GAMES_PAGE_SIZE = 20;
export const PLAYED_GAMES_MAX_PAGE_SIZE = 50;
export const PLAYER_ITEMS_PAGE_SIZE = 50;
export const PLAYER_CONTAINERS_PAGE_SIZE = 50;

export function containerDisplayName(container: PlayerContainer) {
  return container.name || container.definition?.name || container.container_type;
}

export const playerApi = {
  listMyGames: (after?: string | null, limit: number = PLAYED_GAMES_PAGE_SIZE) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (after) {
      params.set("after", after);
    }
    return api.get<PlayedGamesPage>(`/api/v1/player/me/games?${params.toString()}`);
  },
  getMyGamerProgress: (gameId: string) => api.get<MyGamerProgress>(`/api/v1/games/${encodeURIComponent(gameId)}/my-gamer-progress`),
  listMyGameItems: (gameId: string, options: { after?: string | null; name?: string } = {}) => {
    const params = new URLSearchParams({ limit: String(PLAYER_ITEMS_PAGE_SIZE) });
    if (options.after) {
      params.set("after", options.after);
    }
    if (options.name) {
      params.set("name", options.name);
    }
    return api.get<PlayerItemsPage>(`/api/v1/games/${encodeURIComponent(gameId)}/inventory?${params.toString()}`);
  },
  listMyGameContainers: (gameId: string, offset = 0) => {
    const params = new URLSearchParams({ limit: String(PLAYER_CONTAINERS_PAGE_SIZE), offset: String(offset) });
    return api.get<PlayerContainersPage>(`/api/v1/games/${encodeURIComponent(gameId)}/containers?${params.toString()}`);
  },
  listMyContainerItems: (containerId: string) =>
    api.get<PlayerContainerItems>(`/api/v1/containers/${encodeURIComponent(containerId)}/items`),
};
