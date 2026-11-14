"use client";
import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/use-translation";
import { steamLinkApi, steamProfileUrl, type SteamLinkStatus } from "@/lib/steam-link-api";

// Read-only: linking needs a Steam ticket, so it happens in the game client.
export function SteamLinkStatusCard({ id }: { id: string }) {
    const { t, locale } = useTranslation();
    const [status, setStatus] = useState<SteamLinkStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setFailed(false);
        steamLinkApi.status()
            .then(value => { if (!cancelled) setStatus(value); })
            .catch(() => { if (!cancelled) setFailed(true); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [attempt]);

    const linkedAt = status?.linked_at
        ? new Date(status.linked_at).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })
        : "";

    return <section id={id} className={`${id} h-full rounded-md border border-border bg-card/70 p-6`}>
        <header id="steam-link-header" className="steam-link-header mb-4 flex items-center justify-between gap-3">
            <h2 id="steam-link-title" className="steam-link-title font-display text-xl font-semibold">{t("steamLink.title")}</h2>
            <Button id="steam-link-refresh" className="steam-link-refresh" type="button" variant="ghost" size="icon" title={t("games.retry")} aria-label={t("games.retry")} aria-busy={loading} disabled={loading} onClick={() => setAttempt(value => value + 1)}>
                <RefreshCw id="steam-link-refresh-icon" className={`steam-link-refresh-icon size-4${loading ? " animate-spin" : ""}`} aria-hidden />
            </Button>
        </header>
        <div id="steam-link-content" className="steam-link-content space-y-3 text-sm">
            {failed && <p id="steam-link-error" role="alert" className="steam-link-error text-destructive">{t("steamLink.failed")}</p>}
            {!failed && loading && !status && <p id="steam-link-loading" className="steam-link-loading text-muted-foreground">{t("steamLink.loading")}</p>}
            {!failed && status && (status.linked && status.steam_id ? <dl id="steam-link-details" className="steam-link-details divide-y divide-border">
                <div id="steam-link-row-steam-id" className="steam-link-row-steam-id flex flex-wrap items-center justify-between gap-2 py-3">
                    <dt id="steam-link-row-steam-id-label" className="steam-link-row-steam-id-label text-muted-foreground">{t("steamLink.steamId")}</dt>
                    <dd id="steam-link-row-steam-id-value" className="steam-link-row-steam-id-value">
                        <a id="steam-link-profile" className="steam-link-profile inline-flex items-center gap-1.5 font-medium text-primary hover:underline" href={steamProfileUrl(status.steam_id)}>
                            {status.steam_id}
                            <ExternalLink id="steam-link-profile-icon" className="steam-link-profile-icon size-3.5" aria-hidden />
                        </a>
                    </dd>
                </div>
                {linkedAt && <div id="steam-link-row-linked-at" className="steam-link-row-linked-at flex flex-wrap justify-between gap-2 py-3">
                    <dt id="steam-link-row-linked-at-label" className="steam-link-row-linked-at-label text-muted-foreground">{t("steamLink.linkedAt")}</dt>
                    <dd id="steam-link-row-linked-at-value" className="steam-link-row-linked-at-value font-medium">{linkedAt}</dd>
                </div>}
            </dl> : <p id="steam-link-not-linked" className="steam-link-not-linked text-muted-foreground">{t("steamLink.notLinked")}</p>)}
        </div>
    </section>;
}
