"use client";

import { STUDIO_URL } from "@/lib/config";
import { SITE_NAME, STUDIO_SITE_NAME } from "@/lib/site-config";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Site footer: brand, copyright and the link to the Studio site. */
export function AppFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer id="app-footer" className="app-footer border-t border-border bg-card/40">
      <div id="app-footer-inner" className="app-footer-inner mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground">
        <div id="app-footer-brand" className="app-footer-brand flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img id="app-footer-logo" src="/logo.png" alt="" width={24} height={24} className="app-footer-logo size-6 [image-rendering:pixelated]" />
          <span id="app-footer-name" className="app-footer-name font-display text-lg font-bold uppercase leading-none text-foreground">
            {SITE_NAME}
          </span>
          <span id="app-footer-copyright" className="app-footer-copyright">
            {t("footer.copyright", { year })}
          </span>
        </div>
        <a id="app-footer-studio-link" href={STUDIO_URL} className="app-footer-studio-link hover:text-foreground hover:underline">
          {STUDIO_SITE_NAME}
        </a>
      </div>
    </footer>
  );
}
