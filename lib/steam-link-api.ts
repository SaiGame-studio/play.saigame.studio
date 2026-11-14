import { api } from "@/lib/api-client";

export interface SteamLinkStatus {
    linked: boolean;
    steam_id?: string;
    linked_at?: string;
}

export const steamLinkApi = {
    status: () => api.get<SteamLinkStatus>("/api/v1/player/auth/steam"),
};

export function steamProfileUrl(steamId: string): string {
    return `https://steamcommunity.com/profiles/${encodeURIComponent(steamId)}`;
}
