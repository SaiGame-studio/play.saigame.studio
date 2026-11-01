import { api, ApiError } from "@/lib/api-client";

export interface TwoFactorStatus { enabled: boolean; can_disable: boolean; available: boolean; recovery_codes_remaining: number }
export interface TwoFactorSetup { secret: string; qr_code: string; expires_in: number }
export interface TwoFactorProof { code?: string; recovery_code?: string }
export interface TwoFactorChange { enabled: boolean; issuer?: string; recovery_codes?: string[]; reauthentication_required: boolean }

export function factorProof(value: string, recovery: boolean): TwoFactorProof {
    return recovery ? { recovery_code: value.trim() } : { code: value.trim() };
}
export function validFactorProof(value: string, recovery: boolean): boolean {
    return recovery ? /^[a-f0-9]{32}$/i.test(value.replace(/-/g, "")) : /^\d{6}$/.test(value);
}

export const twoFactorApi = {
    status: () => api.get<TwoFactorStatus>("/api/v1/auth/2fa/status"),
    setup: () => api.post<TwoFactorSetup>("/api/v1/auth/2fa/setup"),
    change: (enable: boolean, proof: TwoFactorProof) => api.post<TwoFactorChange>(`/api/v1/auth/2fa/${enable ? "confirm" : "disable"}`, proof),
    replacementSetup: (proof: TwoFactorProof) => api.post<TwoFactorSetup>("/api/v1/auth/2fa/replacement/setup", proof),
    replacementConfirm: (code: string) => api.post<TwoFactorChange>("/api/v1/auth/2fa/replacement/confirm", { code }),
    regenerateRecovery: (proof: TwoFactorProof) => api.post<TwoFactorChange>("/api/v1/auth/2fa/recovery-codes/regenerate", proof),
};

export function twoFactorErrorKey(error: unknown): string {
    const code = error instanceof ApiError ? error.code : undefined;
    const keys: Record<string, string> = {
        TWO_FACTOR_INVALID_CODE: "invalidCode", TWO_FACTOR_RATE_LIMITED: "rateLimited",
        TWO_FACTOR_STUDIO_HISTORY_LOCKED: "studioLocked", TWO_FACTOR_STATE_CHANGED: "stateChanged",
        TWO_FACTOR_UNAVAILABLE: "unavailable",
    };
    return `twoFactor.${(code && keys[code]) || "failed"}`;
}
