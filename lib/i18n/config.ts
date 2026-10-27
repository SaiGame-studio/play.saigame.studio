import en from "./translations/en.json";
import vi from "./translations/vi.json";
import ja from "./translations/ja.json";

export const defaultLocale = "en";
export const locales = ["en", "vi", "ja"] as const;
export type ValidLocale = (typeof locales)[number];

/** Display data for each locale; flags use the same country codes as the Studio site. */
export const localeInfo: Record<ValidLocale, { name: string; nativeName: string; countryCode: string }> = {
  en: { name: "English", nativeName: "English", countryCode: "US" },
  vi: { name: "Vietnamese", nativeName: "Tiếng Việt", countryCode: "VN" },
  ja: { name: "Japanese", nativeName: "日本語", countryCode: "JP" },
};

export const translations = { en, vi, ja } as const;

export function isValidLocale(value: string | null): value is ValidLocale {
  return value !== null && (locales as readonly string[]).includes(value);
}
