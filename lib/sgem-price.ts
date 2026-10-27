import type { PaymentMethod, SgemPackage } from "@/lib/sgem-api";

const LOCALE_CURRENCY: Record<string, string> = { vi: "VND", ja: "JPY", en: "USD" };

/** Picks the price the selected method can charge, else the viewer's locale currency, else the default. */
export function getLocalizedSgemPrice(pkg: SgemPackage, locale: string, method?: PaymentMethod | null) {
  if (method?.supported_currencies && pkg.prices) {
    for (const currency of method.supported_currencies.split(",").map((c) => c.trim()).filter(Boolean)) {
      if (pkg.prices[currency] != null) {
        return { amount: pkg.prices[currency], currency };
      }
    }
  }
  const preferred = LOCALE_CURRENCY[locale];
  if (preferred && pkg.prices?.[preferred] != null) {
    return { amount: pkg.prices[preferred], currency: preferred };
  }
  return { amount: pkg.price_amount, currency: pkg.price_currency };
}

/** Formats a major-unit amount (e.g. 100000 VND, 4.99 USD). */
export function formatMoney(amount: number, currency: string): string {
  if (currency === "VND") return `${amount.toLocaleString("vi-VN")} ₫`;
  if (currency === "JPY") return `¥${amount.toLocaleString("ja-JP")}`;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

/** Formats a minor-unit amount as stored on packages (price_amount / 100). */
export function formatMinorMoney(amountMinor: number, currency: string): string {
  return formatMoney(amountMinor / 100, currency);
}
