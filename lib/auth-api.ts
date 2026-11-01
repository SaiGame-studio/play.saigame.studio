import { api } from "@/lib/api-client";
import type { AuthTokens } from "@/lib/auth-session";

export interface PlayUser {
  id: string;
  email: string;
  username: string;
  display_name: string;
  is_active: boolean;
  is_verified: boolean;
  /** Unix seconds. */
  created_at: number;
}

export interface AuthResponse extends AuthTokens {
  user: PlayUser;
}

export interface TwoFactorChallenge {
  message_code: "TWO_FACTOR_REQUIRED";
  user_id: string;
  challenge_token: string;
  expires_in: number;
}

export type LoginResponse = AuthResponse | TwoFactorChallenge;

export const authApi = {
  login: (identifier: string, password: string) =>
    api.post<LoginResponse>("/api/v1/auth/login", { username: identifier, password }, { requireAuth: false }),
  googleLogin: (idToken: string) =>
    api.post<LoginResponse>("/api/v1/auth/google", { id_token: idToken }, { requireAuth: false }),
  verifyTwoFactor: (challenge: TwoFactorChallenge, proof: { code?: string; recovery_code?: string }) =>
    api.post<AuthResponse>("/api/v1/auth/2fa/verify", { user_id: challenge.user_id, challenge_token: challenge.challenge_token, ...proof }, { requireAuth: false }),
  register: (email: string, username: string, password: string) =>
    api.post<{ user: PlayUser }>("/api/v1/auth/register", { email, username, password }, { requireAuth: false }),
  forgotPassword: (email: string) =>
    api.post<{ message?: string }>("/api/v1/auth/forgot-password", { email }, { requireAuth: false }),
  me: () => api.get<{ user: PlayUser }>("/api/v1/auth/me"),
  logout: () => api.post<{ message: string }>("/api/v1/auth/logout"),
  resendVerification: () => api.post<{ message: string }>("/api/v1/auth/resend-verification"),
};
