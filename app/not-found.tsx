"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <section id="not-found" className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p id="not-found-code" className="font-display text-6xl font-bold text-primary">
        404
      </p>
      <Link id="not-found-home-link" href="/" className="text-sm text-muted-foreground hover:text-primary">
        {t("common.backHome")}
      </Link>
    </section>
  );
}
