import en from "./translations/en.json";
import vi from "./translations/vi.json";
import ja from "./translations/ja.json";

export const defaultLocale = "en";
export const locales = ["en", "vi", "ja"] as const;
export type ValidLocale = (typeof locales)[number];

export const localeLabels: Record<ValidLocale, string> = {
  en: "English",
  vi: "Tiếng Việt",
  ja: "日本語",
};

export const translations = { en, vi, ja } as const;

export function isValidLocale(value: string | null): value is ValidLocale {
  return value !== null && (locales as readonly string[]).includes(value);
}
