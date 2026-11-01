"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/use-translation";
import { authApi, type AuthResponse, type TwoFactorChallenge } from "@/lib/auth-api";
import { ApiError } from "@/lib/api-client";

export function TwoFactorLogin({ id, challenge, onSuccess, onCancel }: { id: string; challenge: TwoFactorChallenge; onSuccess: (result: AuthResponse) => void; onCancel: () => void }) {
    const { t } = useTranslation();
    const [code, setCode] = useState("");
    const [recovery, setRecovery] = useState(false);
    const validCode = recovery ? /^[a-f0-9]{32}$/i.test(code.replace(/-/g, "")) : /^\d{6}$/.test(code);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const submitting = useRef(false);
    const [lockedUntil, setLockedUntil] = useState(0);
    const locked = lockedUntil > Date.now();
    useEffect(() => {
        if (!lockedUntil) return;
        const timer = setTimeout(() => setLockedUntil(0), Math.max(0, lockedUntil - Date.now()));
        return () => clearTimeout(timer);
    }, [lockedUntil]);
    const verify = async (value = code) => {
        const valid = recovery ? /^[a-f0-9]{32}$/i.test(value.replace(/-/g, "")) : /^\d{6}$/.test(value);
        if (submitting.current || lockedUntil > Date.now() || !valid) return;
        submitting.current = true;
        setBusy(true); setError("");
        try { onSuccess(await authApi.verifyTwoFactor(challenge, recovery ? { recovery_code: value } : { code: value })); }
        catch (error) {
            setError(t("twoFactor.failed"));
            if (error instanceof ApiError && (error.status === 429 || error.code === "TWO_FACTOR_RATE_LIMITED")) {
                const seconds = Number((error.data as { retry_after?: number } | undefined)?.retry_after);
                setLockedUntil(Date.now() + (Number.isFinite(seconds) && seconds > 0 ? seconds : 60) * 1000);
            }
        }
        finally { submitting.current = false; setBusy(false); }
    };
    return <div id={id} className={`${id} space-y-4`}>
        <p id={`${id}-help`} className={`${id}-help text-sm text-muted-foreground`}>{t("twoFactor.loginHelp")}</p>
        {error && <p id={`${id}-error`} className={`${id}-error text-sm text-destructive`} role="alert">{error}</p>}
        <label id={`${id}-label`} className={`${id}-label text-sm`} htmlFor={`${id}-code`}>{t(recovery ? "twoFactor.recoveryCode" : "twoFactor.code")}</label>
        <Input id={`${id}-code`} className={`${id}-code`} value={code} onChange={event => {
            if (submitting.current || locked) return;
            const next = recovery ? event.target.value.replace(/[^a-f0-9-]/gi, "").toUpperCase().slice(0, 35) : event.target.value.replace(/\D/g, "").slice(0, 6);
            setCode(next);
            if (!recovery && next.length === 6 && next !== code) void verify(next);
        }} autoComplete={recovery ? "off" : "one-time-code"} inputMode={recovery ? "text" : "numeric"} maxLength={recovery ? 35 : 6} autoFocus disabled={busy || locked} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void verify(); } }} />
        <Button id={`${id}-toggle`} className={`${id}-toggle`} type="button" disabled={busy} onClick={() => { setRecovery(!recovery); setCode(""); setError(""); }}>{t(recovery ? "twoFactor.useAuthenticator" : "twoFactor.useRecovery")}</Button>
        <div id={`${id}-actions`} className={`${id}-actions flex flex-wrap gap-3`}>
            <Button id={`${id}-submit`} className={`${id}-submit`} type="button" disabled={busy || locked || !validCode} onClick={() => void verify()}>{t("twoFactor.verify")}</Button>
            <Button id={`${id}-back`} className={`${id}-back`} type="button" disabled={busy} onClick={onCancel}>{t("twoFactor.back")}</Button>
        </div>
    </div>;
}
