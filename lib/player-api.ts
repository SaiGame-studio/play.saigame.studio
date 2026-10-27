import { api } from "@/lib/api-client";

/** Player API (ss-go /api/v1/player/*): only the signed-in player's own data. */

export interface PlayedGame {
  game_id: string;
  game_name: string;
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

export const PLAYED_GAMES_PAGE_SIZE = 20;

export const playerApi = {
  listMyGames: (after?: string | null) => {
    const params = new URLSearchParams({ limit: String(PLAYED_GAMES_PAGE_SIZE) });
    if (after) {
      params.set("after", after);
    }
    return api.get<PlayedGamesPage>(`/api/v1/player/me/games?${params.toString()}`);
  },
};
