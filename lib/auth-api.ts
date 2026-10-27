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

export const authApi = {
  login: (identifier: string, password: string) =>
    api.post<AuthResponse>("/api/v1/auth/login", { username: identifier, password }, { requireAuth: false }),
  googleLogin: (idToken: string) =>
    api.post<AuthResponse>("/api/v1/auth/google", { id_token: idToken }, { requireAuth: false }),
  register: (email: string, username: string, password: string) =>
    api.post<{ user: PlayUser }>("/api/v1/auth/register", { email, username, password }, { requireAuth: false }),
  forgotPassword: (email: string) =>
    api.post<{ message?: string }>("/api/v1/auth/forgot-password", { email }, { requireAuth: false }),
  me: () => api.get<{ user: PlayUser }>("/api/v1/auth/me"),
  logout: () => api.post<{ message: string }>("/api/v1/auth/logout"),
  resendVerification: () => api.post<{ message: string }>("/api/v1/auth/resend-verification"),
};
