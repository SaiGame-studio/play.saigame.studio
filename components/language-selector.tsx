"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { CountryFlag } from "@/components/country-flag";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { localeInfo, locales } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

/** Language picker with country flags, matching the Studio site's selector. */
export function LanguageSelector({ align = "right" }: { align?: "left" | "right" }) {
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = localeInfo[locale];

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div id="language-selector" ref={rootRef} className="relative">
      <button
        id="language-selector-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${t("common.language")}: ${current.nativeName}`}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-9 items-center gap-1 rounded-md px-2 text-sm hover:bg-muted"
      >
        <CountryFlag id="language-selector-trigger-flag" countryCode={current.countryCode} title={current.name} />
        <ChevronDown id="language-selector-trigger-chevron" className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} aria-hidden />
      </button>
      {isOpen && (
        <ul
          id="language-selector-menu"
          role="listbox"
          aria-label={t("common.language")}
          className={cn("absolute z-30 mt-1 min-w-[12rem] overflow-hidden rounded-md border border-border bg-card p-1 shadow-xl shadow-black/40", align === "right" ? "right-0" : "left-0")}
        >
          {locales.map((code) => {
            const info = localeInfo[code];
            const isSelected = code === locale;
            return (
              <li id={`language-selector-option-${code}`} key={code} role="option" aria-selected={isSelected}>
                <button
                  id={`language-selector-option-${code}-button`}
                  type="button"
                  onClick={() => {
                    setLocale(code);
                    setIsOpen(false);
                  }}
                  className={cn("flex w-full items-center gap-3 rounded px-2 py-1.5 text-left hover:bg-muted", isSelected && "bg-muted/60")}
                >
                  <CountryFlag id={`language-selector-option-${code}-flag`} countryCode={info.countryCode} title={info.name} />
                  <span id={`language-selector-option-${code}-text`} className="flex flex-1 flex-col">
                    <span id={`language-selector-option-${code}-native`} className="text-sm font-medium">
                      {info.nativeName}
                    </span>
                    <span id={`language-selector-option-${code}-name`} className="text-xs text-muted-foreground">
                      {info.name}
                    </span>
                  </span>
                  {isSelected && <Check id={`language-selector-option-${code}-check`} className="size-4 text-primary" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
