import { api } from "@/lib/api-client";

/**
 * Public game info (ss-go GET /api/v1/public/games/{game_id}/info), set in the Studio.
 * Open to guests; the token is sent when signed in, so studio members can still read a game the
 * studio has not made public (others get 404 GAME_NOT_PUBLIC).
 */

export type GameReleaseStatus = "released" | "coming_soon" | "to_be_announced";

export interface GamePublicInfo {
  game_name: string;
  /** null when the studio has not published any info yet. */
  release_status: GameReleaseStatus | null;
  /** ISO timestamp; set when released. */
  release_at: string | null;
  /** Free-text release window, e.g. "Q4 2026"; only for coming_soon. */
  release_date_text: string | null;
  content: string | null;
  image_url: string | null;
  is_public: boolean;
}

export const GAME_NOT_PUBLIC = "GAME_NOT_PUBLIC";

/** One game a studio has made public (GET /api/v1/public/games). */
export interface PublicGame {
  game_id: string;
  game_name: string;
  image_url: string | null;
  release_status: GameReleaseStatus;
  release_at: string | null;
  release_date_text: string | null;
}

export interface PublicGamesPage {
  games: PublicGame[];
  next_cursor: string | null;
}

export const PUBLIC_GAMES_PAGE_SIZE = 20;

export const gameInfoApi = {
  listPublicGames: (after?: string | null) => {
    const params = new URLSearchParams({ limit: String(PUBLIC_GAMES_PAGE_SIZE) });
    if (after) params.set("after", after);
    return api.get<PublicGamesPage>(`/api/v1/public/games?${params.toString()}`, { requireAuth: false });
  },
  getPublicInfo: (gameId: string) =>
    api.get<GamePublicInfo>(`/api/v1/public/games/${encodeURIComponent(gameId)}/info`, { requireAuth: "optional" }),
};
