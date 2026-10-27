"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { localeLabels, locales, isValidLocale } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/use-translation";

export function LanguageSelector() {
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslation();

  return (
    <label id="language-selector" className="relative inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 text-sm">
      <Languages id="language-selector-icon" className="size-4 text-muted-foreground" aria-hidden />
      <span id="language-selector-label" className="sr-only">
        {t("common.language")}
      </span>
      <select
        id="language-selector-select"
        value={locale}
        onChange={(event) => isValidLocale(event.target.value) && setLocale(event.target.value)}
        className="h-9 cursor-pointer appearance-none bg-transparent pr-1 outline-none"
      >
        {locales.map((code) => (
          <option id={`language-selector-option-${code}`} key={code} value={code} className="bg-card">
            {localeLabels[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
