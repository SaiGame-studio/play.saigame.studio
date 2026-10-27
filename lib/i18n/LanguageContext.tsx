"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultLocale, isValidLocale, type ValidLocale } from "./config";

interface LanguageContextValue {
  locale: ValidLocale;
  setLocale: (locale: ValidLocale) => void;
}

// Same key as the Studio frontend so a language choice carries over per browser profile.
const LANGUAGE_STORAGE_KEY = "preferred-language";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<ValidLocale>(defaultLocale);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (isValidLocale(saved)) {
        setLocaleState(saved);
      }
    } catch {
      // Storage unavailable (private mode); keep default.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (next: ValidLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // Ignore storage errors.
    }
  };

  return <LanguageContext.Provider value={{ locale, setLocale }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
