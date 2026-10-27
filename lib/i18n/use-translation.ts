"use client";

import { useCallback } from "react";
import { useLanguage } from "./LanguageContext";
import { translations } from "./config";

type TranslationParams = Record<string, string | number>;

export function useTranslation() {
  const { locale } = useLanguage();

  const t = useCallback(
    (key: string, params?: TranslationParams) => {
      let value: unknown = translations[locale];
      for (const part of key.split(".")) {
        value = value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined;
      }
      if (typeof value !== "string") {
        return key;
      }
      return params
        ? Object.entries(params).reduce((text, [name, v]) => text.replaceAll(`{${name}}`, String(v)), value)
        : value;
    },
    [locale],
  );

  return { t, locale };
}
