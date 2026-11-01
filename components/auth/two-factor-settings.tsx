"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/lib/i18n/use-translation";
import { factorProof, validFactorProof, twoFactorApi, twoFactorErrorKey, type TwoFactorSetup, type TwoFactorStatus, type TwoFactorChange } from "@/lib/two-factor-api";
import { Button } from "@/components/ui/button";
import { TwoFactorProofInput } from "@/components/auth/two-factor-proof-input";
import { TwoFactorRecoveryCodes } from "@/components/auth/two-factor-recovery-codes";
import { ApiError } from "@/lib/api-client";
import { RefreshCw } from "lucide-react";
type SecurityAction = "disable" | "replace" | "regenerate" | null;
export function TwoFactorSettings({ id }: {
    id: string;
}) {
    const { t } = useTranslation();
    const { logout, user, requireReauthentication } = useAuth();
    const [status, setStatus] = useState<TwoFactorStatus | null>(null);
    const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
    const [action, setAction] = useState<SecurityAction>(null);
    const [code, setCode] = useState("");
    const [recovery, setRecovery] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<TwoFactorChange | null>(null);
    const [statusAttempt, setStatusAttempt] = useState(0);
    const [statusLoading, setStatusLoading] = useState(false);
    const statusBlocked = useRef(false);
    statusBlocked.current = busy || setup !== null || action !== null;
    const [lockedUntil, setLockedUntil] = useState(0);
    const locked = lockedUntil > Date.now();
    useEffect(() => {
        if (!lockedUntil) return;
        const timer = setTimeout(() => setLockedUntil(0), Math.max(0, lockedUntil - Date.now()));
        return () => clearTimeout(timer);
    }, [lockedUntil]);
    const handleError = (err: unknown) => {
        setError(t(twoFactorErrorKey(err)));
        if (err instanceof ApiError && (err.status === 429 || err.code === "TWO_FACTOR_RATE_LIMITED")) {
            const seconds = Number((err.data as { retry_after?: number } | undefined)?.retry_after);
            setLockedUntil(Date.now() + (Number.isFinite(seconds) && seconds > 0 ? seconds : 300) * 1000);
        }
    };
    useEffect(() => {
        if (result)
            return;
        let cancelled = false;
        let loading = false;
        const load = async () => {
            if (loading || statusBlocked.current) return;
            loading = true;
            const startedAt = performance.now();
            setStatusLoading(true);
            try {
                const value = await twoFactorApi.status();
                if (!cancelled) { setStatus(value); setError(""); }
            } catch (err) {
                if (!cancelled) setError(t(twoFactorErrorKey(err)));
            } finally {
                const remaining = 500 - (performance.now() - startedAt);
                if (remaining > 0) await new Promise<void>(resolve => setTimeout(resolve, remaining));
                loading = false;
                if (!cancelled) setStatusLoading(false);
            }
        };
        const onVisible = () => { if (document.visibilityState === "visible") void load(); };
        void load();
        window.addEventListener("focus", load);
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            cancelled = true;
            window.removeEventListener("focus", load);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [t, result, statusAttempt]);
    const reset = () => { setSetup(null); setAction(null); setCode(""); setRecovery(false); setError(""); };
    const selectAction = (value: SecurityAction) => { reset(); setAction(value); };
    const begin = async () => {
        if (submitting.current || lockedUntil > Date.now()) return;
        submitting.current = true;
        setBusy(true);
        setError("");
        try {
            setSetup(await twoFactorApi.setup());
            setCode("");
            setRecovery(false);
        }
        catch (err) {
            handleError(err);
        }
        finally {
            submitting.current = false;
            setBusy(false);
        }
    };
    const submitting = useRef(false);
    const submit = async (event?: FormEvent, value = code) => {
        event?.preventDefault();
        if (submitting.current || lockedUntil > Date.now() || !validFactorProof(value, recovery) || (!setup && !action) || (action === "disable" && !status?.can_disable))
            return;
        submitting.current = true;
        setBusy(true);
        setError("");
        try {
            if (action === "replace" && !setup) {
                setSetup(await twoFactorApi.replacementSetup(factorProof(value, recovery)));
                setCode("");
                setRecovery(false);
                return;
            }
            const changed = setup
                ? action === "replace" ? await twoFactorApi.replacementConfirm(value) : await twoFactorApi.change(true, { code: value })
                : action === "regenerate" ? await twoFactorApi.regenerateRecovery(factorProof(value, recovery))
                    : await twoFactorApi.change(false, factorProof(value, recovery));
            reset();
            if (changed.reauthentication_required)
                requireReauthentication();
            setResult(changed);
        }
        catch (err) {
            handleError(err);
            twoFactorApi.status().then(setStatus).catch(() => undefined);
        }
        finally {
            submitting.current = false;
            setBusy(false);
        }
    };
    const hasForm = setup !== null || action !== null;
    const submitKey = setup ? "twoFactor.confirm" : action === "replace" ? "twoFactor.continueReplacement" : action === "regenerate" ? "twoFactor.regenerateCodes" : "twoFactor.disable";
    return <section id={id} className={`${id} mt-6 rounded-md border border-border bg-card/70 p-6`}>
        <header id="user-2fa-header" className="user-2fa-header mb-4 flex items-center justify-between gap-3">
            <h2 id="user-2fa-title" className="user-2fa-title font-display text-xl font-semibold">{t("twoFactor.title")}</h2>
            {!result && !hasForm && <Button id="user-2fa-refresh" className="user-2fa-refresh" type="button" variant="ghost" size="icon" title={t("games.retry")} aria-label={t("games.retry")} aria-busy={statusLoading} disabled={busy || locked || statusLoading} onClick={() => setStatusAttempt(value => value + 1)}>
                <RefreshCw id="user-2fa-refresh-icon" className={`user-2fa-refresh-icon size-4${statusLoading ? " animate-spin" : ""}`} aria-hidden />
            </Button>}
        </header>
        <div id="user-2fa-content" className="user-2fa-content space-y-4">
            {error && <p id="user-2fa-error" role="alert" className="user-2fa-error text-sm text-destructive">{error}</p>}
            {result ? result.recovery_codes?.length ? <TwoFactorRecoveryCodes id="user-2fa-recovery-codes" codes={result.recovery_codes} issuer={result.issuer || "SaiGame"} accountEmail={user?.email || ""} onContinue={logout}/> : <div id="user-2fa-completed" className="user-2fa-completed space-y-3">
                <p id="user-2fa-completed-message" className="user-2fa-completed-message text-sm">{t("twoFactor.changed")}</p>
                <Button id="user-2fa-sign-in" onClick={logout} className="user-2fa-sign-in">{t("twoFactor.signInAgain")}</Button>
            </div> : status && <>
                <p id="user-2fa-status" className={"user-2fa-status" + " " + (status.enabled ? "text-sm" : "text-sm text-amber-600 dark:text-amber-400")}>{t(status.enabled ? "twoFactor.enabled" : "twoFactor.disabled")}</p>
                {!status.available && <p id="user-2fa-unavailable" className="user-2fa-unavailable text-sm text-muted-foreground">{t("twoFactor.unavailable")}</p>}
                {status.enabled && <p id="user-2fa-recovery-count" className="user-2fa-recovery-count text-sm">{t("twoFactor.codesRemaining", { count: status.recovery_codes_remaining })}</p>}
                {status.enabled && status.recovery_codes_remaining === 0 && <p id="user-2fa-recovery-warning" className="user-2fa-recovery-warning text-sm text-destructive">{t("twoFactor.noRecoveryCodes")}</p>}
                {!hasForm && <div id="user-2fa-management-actions" className="user-2fa-management-actions flex flex-wrap gap-2">
                    {!status.enabled ? <Button id="user-2fa-enable" disabled={busy || locked || !status.available} onClick={begin} className="user-2fa-enable">{t("twoFactor.enable")}</Button> : <>
                        <Button id="user-2fa-replace" variant="outline" disabled={busy || locked || !status.available} onClick={() => selectAction("replace")} className="user-2fa-replace">{t("twoFactor.changeDevice")}</Button>
                        <Button id="user-2fa-regenerate" variant="outline" disabled={busy || locked} onClick={() => selectAction("regenerate")} className="user-2fa-regenerate">{t("twoFactor.regenerateCodes")}</Button>
                    </>}
                </div>}
                {!hasForm && status.enabled && <div id="user-2fa-disable-row" className="user-2fa-disable-row flex flex-wrap items-center gap-2">
                    <Button id="user-2fa-disable" variant="outline" disabled={busy || locked || !status.can_disable} onClick={() => selectAction("disable")} className="user-2fa-disable">{t("twoFactor.disable")}</Button>
                    {!status.can_disable && <div id="user-2fa-disable-notes" className="user-2fa-disable-notes text-sm text-muted-foreground">
                        <p id="user-2fa-studio-lock" className="user-2fa-studio-lock text-amber-600 dark:text-amber-400">{t("twoFactor.studioLocked")}</p>
                    </div>}
                </div>}
                {action === "replace" && <p id="user-2fa-replace-help" className="user-2fa-replace-help text-sm text-muted-foreground">{t(setup ? "twoFactor.replacementScanHelp" : "twoFactor.replacementHelp")}</p>}
                {action === "regenerate" && <p id="user-2fa-regenerate-help" className="user-2fa-regenerate-help text-sm text-muted-foreground">{t("twoFactor.regenerateHelp")}</p>}
                {setup && <div id="user-2fa-setup" className="user-2fa-setup space-y-3">
                    <p id="user-2fa-scan-help" className="user-2fa-scan-help text-sm">{t("twoFactor.scan")}</p>
                    <img id="user-2fa-qr" src={setup.qr_code} alt={t("twoFactor.qrAlt")} width={256} height={256} className="user-2fa-qr"/>
                    <p id="user-2fa-manual-help" className="user-2fa-manual-help text-sm">{t("twoFactor.manualKey")}</p>
                    <code id="user-2fa-secret" className="user-2fa-secret block break-all rounded bg-muted p-2">{setup.secret}</code>
                    <p id="user-2fa-expiry" className="user-2fa-expiry text-xs text-muted-foreground">{t("twoFactor.setupExpiry")}</p>
                </div>}
                {hasForm && <form id="user-2fa-form" onSubmit={submit} className="user-2fa-form space-y-3">
                    <TwoFactorProofInput id="user-2fa-proof" value={code} onChange={setCode} onComplete={value => void submit(undefined, value)} recovery={recovery} onRecoveryChange={setRecovery} disabled={busy || locked} allowRecovery={!setup}/>
                    <div id="user-2fa-actions" className="user-2fa-actions flex flex-wrap gap-2">
                        <Button id="user-2fa-submit" disabled={busy || locked || !validFactorProof(code, recovery)} className="user-2fa-submit">{t(submitKey)}</Button>
                        <Button id="user-2fa-cancel" type="button" variant="outline" disabled={busy || locked} onClick={reset} className="user-2fa-cancel">{t("twoFactor.cancel")}</Button>
                    </div>
                </form>}
            </>}
        </div>
    </section>;
}
