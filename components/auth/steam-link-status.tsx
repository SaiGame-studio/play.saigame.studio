"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { SteamClaimedGames } from "@/components/auth/steam-claimed-games";
import { Button } from "@/components/ui/button";
import { TwoFactorProofInput } from "@/components/auth/two-factor-proof-input";
import { useAuth } from "@/contexts/auth-context";
import { useConfirm } from "@/contexts/confirm-context";
import { accountTabHref } from "@/lib/account-routes";
import { ApiError } from "@/lib/api-client";
import { setSession } from "@/lib/auth-session";
import { useTranslation } from "@/lib/i18n/use-translation";
import { factorProof, validFactorProof } from "@/lib/two-factor-api";
import {
    steamLinkApi, steamProfileUrl, steamUnlinkErrorKey, STEAM_UNLINK_REAUTH_REQUIRED, STEAM_UNLINK_TWO_FACTOR_REQUIRED,
    type SteamLinkStatus,
} from "@/lib/steam-link-api";

// Linking needs a Steam ticket, so it happens in the game client. Unlinking
// happens only here, on Sai Play.
export function SteamLinkStatusCard({ id }: { id: string }) {
    const { t, locale } = useTranslation();
    const { relogin } = useAuth();
    const confirm = useConfirm();
    const [status, setStatus] = useState<SteamLinkStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [busy, setBusy] = useState(false);
    const [needsProof, setNeedsProof] = useState(false);
    const [needsReauth, setNeedsReauth] = useState(false);
    const [code, setCode] = useState("");
    const [recovery, setRecovery] = useState(false);
    const [error, setError] = useState("");
    const submitting = useRef(false);

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

    const formatDate = (value?: string) => value
        ? new Date(value).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })
        : "";
    const linkedAt = formatDate(status?.linked_at);
    const relinkAt = status?.relink_available_at
        ? new Date(status.relink_available_at).toLocaleString(locale, { dateStyle: "long", timeStyle: "short" })
        : "";

    const resetUnlink = () => { setNeedsProof(false); setNeedsReauth(false); setCode(""); setRecovery(false); setError(""); };

    const unlink = async (proofValue?: string) => {
        if (submitting.current) return;
        submitting.current = true;
        setBusy(true);
        setError("");
        try {
            const result = await steamLinkApi.unlink(proofValue === undefined ? {} : factorProof(proofValue, recovery));
            // Every other session was signed out; keep this one with the new token.
            setSession({ access_token: result.access_token, expires_in: result.expires_in });
            resetUnlink();
            setStatus({ linked: false, relink_available_at: result.relink_available_at });
        } catch (err) {
            const code = err instanceof ApiError ? err.code : undefined;
            if (code === STEAM_UNLINK_TWO_FACTOR_REQUIRED) {
                setNeedsProof(true);
            } else {
                // Keep an invalid code in the input so the user can edit it.
                if (code === STEAM_UNLINK_REAUTH_REQUIRED) setNeedsReauth(true);
                setError(t(steamUnlinkErrorKey(err)));
            }
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    };

    const startUnlink = async () => {
        resetUnlink();
        const confirmed = await confirm({
            id: "steam-unlink-confirm",
            title: t("steamLink.unlink.confirmTitle"),
            description: t("steamLink.unlink.confirmDescription"),
            confirmText: t("steamLink.unlink.button"),
            tone: "danger",
        });
        if (confirmed) await unlink();
    };

    const submitProof = (event?: FormEvent, value = code) => {
        event?.preventDefault();
        if (!validFactorProof(value, recovery)) return;
        void unlink(value);
    };

    return <section id={id} className={`${id} h-full rounded-md border border-border bg-card/70 p-6`}>
        <header id="steam-link-header" className="steam-link-header mb-4 flex items-center justify-between gap-3">
            <h2 id="steam-link-title" className="steam-link-title font-display text-xl font-semibold">{t("steamLink.title")}</h2>
            <Button id="steam-link-refresh" className="steam-link-refresh" type="button" variant="ghost" size="icon" title={t("games.retry")} aria-label={t("games.retry")} aria-busy={loading} disabled={loading || busy} onClick={() => setAttempt(value => value + 1)}>
                <RefreshCw id="steam-link-refresh-icon" className={`steam-link-refresh-icon size-4${loading ? " animate-spin" : ""}`} aria-hidden />
            </Button>
        </header>
        <div id="steam-link-content" className="steam-link-content space-y-3 text-sm">
            {failed && <p id="steam-link-error" role="alert" className="steam-link-error text-destructive">{t("steamLink.failed")}</p>}
            {!failed && loading && !status && <p id="steam-link-loading" className="steam-link-loading text-muted-foreground">{t("steamLink.loading")}</p>}
            {!failed && status && (status.linked && status.steam_id ? <>
                <dl id="steam-link-details" className="steam-link-details divide-y divide-border">
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
                </dl>
                <SteamClaimedGames reloadKey={attempt} />
                <p id="steam-unlink-cooldown" className="steam-unlink-cooldown border-t border-border pt-4 text-muted-foreground">{t("steamLink.unlink.cooldownNotice")}</p>
                {error && <p id="steam-unlink-error" role="alert" className="steam-unlink-error text-destructive">{error}</p>}
                {needsReauth && <Button id="steam-unlink-sign-in" className="steam-unlink-sign-in" type="button" variant="outline" onClick={() => void relogin(accountTabHref("steam"))}>{t("steamLink.unlink.signInAgain")}</Button>}
                {needsProof ? <form id="steam-unlink-form" onSubmit={submitProof} className="steam-unlink-form space-y-3">
                    <p id="steam-unlink-proof-help" className="steam-unlink-proof-help text-muted-foreground">{t("steamLink.unlink.proofHelp")}</p>
                    <TwoFactorProofInput id="steam-unlink-proof" value={code} onChange={setCode} onComplete={value => submitProof(undefined, value)} recovery={recovery} onRecoveryChange={setRecovery} disabled={busy} />
                    <div id="steam-unlink-actions" className="steam-unlink-actions flex flex-wrap gap-2">
                        <Button id="steam-unlink-submit" className="steam-unlink-submit" variant="danger" disabled={busy || !validFactorProof(code, recovery)}>{t("steamLink.unlink.button")}</Button>
                        <Button id="steam-unlink-cancel" className="steam-unlink-cancel" type="button" variant="outline" disabled={busy} onClick={resetUnlink}>{t("twoFactor.cancel")}</Button>
                    </div>
                </form> : <Button id="steam-unlink-button" className="steam-unlink-button" type="button" variant="danger" disabled={busy || loading} onClick={() => void startUnlink()}>{t("steamLink.unlink.button")}</Button>}
            </> : <>
                <p id="steam-link-not-linked" className="steam-link-not-linked text-muted-foreground">{t("steamLink.notLinked")}</p>
                {relinkAt && <p id="steam-unlink-done" className="steam-unlink-done">{t("steamLink.unlink.relinkAvailableAt", { date: relinkAt })}</p>}
            </>)}
        </div>
    </section>;
}
