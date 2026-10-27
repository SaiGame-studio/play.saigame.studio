import type { PaymentStatus } from "@/lib/sgem-api";

/** Bank-transfer / gateway details returned with a purchase (normalised from snake_case or PascalCase). */
export interface PaymentIntent {
  qrCodeData: string;
  transferAmount: number;
  transferNote: string;
  expiresAt: string;
  payUrl: string;
}

function pick(raw: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (raw[key] != null && raw[key] !== "") {
      return raw[key];
    }
  }
  return undefined;
}

export function normalizeIntent(raw: Record<string, unknown> | undefined | null): PaymentIntent | null {
  if (!raw) {
    return null;
  }
  return {
    qrCodeData: String(pick(raw, "qr_code_data", "QRCodeData") ?? ""),
    transferAmount: Number(pick(raw, "transfer_amount", "TransferAmount") ?? 0),
    transferNote: String(pick(raw, "transfer_note", "TransferNote") ?? ""),
    expiresAt: String(pick(raw, "expires_at", "ExpiresAt") ?? ""),
    payUrl: String(pick(raw, "pay_url", "PayURL", "MoMoPayURL", "momo_pay_url", "CheckoutURL", "checkout_url") ?? ""),
  };
}

export function isWaiting(status: PaymentStatus) {
  return status === "pending" || status === "awaiting_payment" || status === "processing";
}
