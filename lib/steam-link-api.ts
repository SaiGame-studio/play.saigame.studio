import { api, ApiError } from "@/lib/api-client";
import type { TwoFactorProof } from "@/lib/two-factor-api";

export interface SteamLinkStatus {
    linked: boolean;
    steam_id?: string;
    linked_at?: string;
}

export interface SteamUnlinkResult {
    linked: false;
    steam_id: string;
    access_token: string;
    expires_in: number;
    relink_available_at: string;
}

export const steamLinkApi = {
    status: () => api.get<SteamLinkStatus>("/api/v1/player/auth/steam"),
    // Only accepted from a Sai Play session. Signs out every other session and
    // returns a new access token for this one.
    unlink: (proof: TwoFactorProof = {}) => api.post<SteamUnlinkResult>("/api/v1/player/auth/steam/unlink", proof),
};

export function steamProfileUrl(steamId: string): string {
    return `https://steamcommunity.com/profiles/${encodeURIComponent(steamId)}`;
}

export const STEAM_UNLINK_TWO_FACTOR_REQUIRED = "STEAM_LINK_TWO_FACTOR_REQUIRED";
export const STEAM_UNLINK_REAUTH_REQUIRED = "STEAM_LINK_REAUTH_REQUIRED";

/** Translation key for an unlink failure. */
export function steamUnlinkErrorKey(error: unknown): string {
    const code = error instanceof ApiError ? error.code : undefined;
    const keys: Record<string, string> = {
        [STEAM_UNLINK_REAUTH_REQUIRED]: "reauthRequired",
        STEAM_UNLINK_NO_SIGN_IN: "noSignIn",
        STEAM_UNLINK_SAI_PLAY_ONLY: "saiPlayOnly",
        STEAM_NOT_LINKED: "alreadyUnlinked",
        TWO_FACTOR_INVALID_CODE: "invalidCode",
        TWO_FACTOR_RATE_LIMITED: "rateLimited",
        RATE_LIMIT_EXCEEDED: "rateLimited",
    };
    if (code && keys[code]) return `steamLink.unlink.${keys[code]}`;
    if (error instanceof ApiError && error.status === 429) return "steamLink.unlink.rateLimited";
    return "steamLink.unlink.failed";
}
