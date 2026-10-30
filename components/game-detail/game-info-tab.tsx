"use client";

import type { GamePublicInfo } from "@/lib/game-info-api";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Game Detail tab: the game's public info as published from the Studio. */
export function GameInfoTab({ info }: { info: GamePublicInfo }) {
  const { t, locale } = useTranslation();
  const content = info.content?.trim() ?? "";

  if (!info.release_status && !content) {
    return (
      <p id="game-info-empty" className="game-info-empty text-muted-foreground">
        {t("gameDetail.noPublicInfo")}
      </p>
    );
  }

  const statusLabel = info.release_status ? t(`gameDetail.status.${info.release_status}`) : null;
  const releaseDetail =
    info.release_status === "released" && info.release_at
      ? new Date(info.release_at).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })
      : info.release_status === "coming_soon"
        ? info.release_date_text
        : null;

  return (
    <div id="game-info" className="game-info grid gap-8 md:grid-cols-[14rem_1fr]">
      {statusLabel && (
        <dl id="game-info-release" className="game-info-release space-y-1">
          <dt id="game-info-release-label" className="game-info-release-label text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t("gameDetail.releaseStatus")}
          </dt>
          <dd id="game-info-release-status" className="game-info-release-status font-display text-2xl font-bold uppercase leading-tight text-accent">
            {statusLabel}
          </dd>
          {releaseDetail && (
            <dd id="game-info-release-detail" className="game-info-release-detail text-sm text-foreground">
              {releaseDetail}
            </dd>
          )}
        </dl>
      )}
      {content && (
        <div id="game-info-content" className="game-info-content max-w-[70ch] whitespace-pre-line leading-relaxed text-foreground/90 md:col-start-2">
          {content}
        </div>
      )}
    </div>
  );
}
