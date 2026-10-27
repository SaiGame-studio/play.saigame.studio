import { api } from "@/lib/api-client";

/** sGem wallet and purchase endpoints (account-level, audience "Player" in ss-go). */

export interface SgemWallet {
  id: string;
  user_id: string;
  balance: number;
  total_bought: number;
  total_spent: number;
}

export interface SgemPackage {
  id: string;
  package_key: string;
  name: string;
  description: string;
  sgem_amount: number;
  /** Minor units (e.g. cents). */
  price_amount: number;
  price_currency: string;
  prices?: Record<string, number>;
  is_active: boolean;
  sort_order: number;
}

export interface PaymentMethod {
  id: string;
  provider_key: string;
  display_name: string;
  description: string;
  is_active: boolean;
  supported_currencies?: string;
}

export type PaymentStatus =
  | "pending"
  | "awaiting_payment"
  | "processing"
  | "completed"
  | "failed"
  | "expired"
  | "credit_failed";

export interface PaymentTransaction {
  id: string;
  currency_type: "sgem" | "scoin";
  provider_key: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  currency_amount: number;
}

/** Raw purchase response; intent fields come back in either snake_case or PascalCase. */
export interface PurchaseResponse {
  transaction?: PaymentTransaction;
  intent?: Record<string, unknown>;
  data?: { transaction?: PaymentTransaction; intent?: Record<string, unknown> };
}

export const SGEM_WALLET_REFRESH_EVENT = "sgem-wallet:refresh";

export function requestWalletRefresh() {
  window.dispatchEvent(new CustomEvent(SGEM_WALLET_REFRESH_EVENT));
}

export function newIdempotencyKey(): string {
  return typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export const sgemApi = {
  getWallet: () => api.get<SgemWallet>("/api/v1/me/sgem-wallet"),
  listPackages: async () => {
    const data = await api.get<{ packages?: SgemPackage[] }>("/api/v1/payments/sgem-packages");
    return (data.packages ?? []).filter((p) => p.is_active);
  },
  getPackage: async (id: string) => {
    const data = await api.get<{ package?: SgemPackage } & Partial<SgemPackage>>(`/api/v1/payments/sgem-packages/${id}`);
    return (data.package ?? data) as SgemPackage;
  },
  listMethods: async (locale: string) => {
    const data = await api.get<{ methods?: PaymentMethod[] }>(`/api/v1/payments/methods?lang=${encodeURIComponent(locale)}`);
    return (data.methods ?? []).filter((m) => m.is_active);
  },
  purchase: (packageId: string, methodConfigId: string) =>
    api.post<PurchaseResponse>(`/api/v1/payments/sgem-packages/${packageId}/purchase`, {
      method_config_id: methodConfigId,
      idempotency_key: newIdempotencyKey(),
    }),
  getTransaction: (id: string) =>
    api.get<PaymentTransaction & { transaction?: PaymentTransaction }>(`/api/v1/payments/transactions/${id}`),
  initiateDirectTransfer: (packageKey: string) =>
    api.post<{ transaction?: { id: string } }>("/api/v1/payments/direct-transfer/initiate", {
      package_key: packageKey,
      idempotency_key: newIdempotencyKey(),
    }),
  confirmDirectTransfer: (transactionId: string, transferInfo: string) =>
    api.post(`/api/v1/payments/direct-transfer/${transactionId}/confirm`, { transfer_info: transferInfo }),
};
