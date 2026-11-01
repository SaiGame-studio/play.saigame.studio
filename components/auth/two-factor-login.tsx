"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/use-translation";
import { authApi, type AuthResponse, type TwoFactorChallenge } from "@/lib/auth-api";

export function TwoFactorLogin({ id, challenge, onSuccess, onCancel }: { id: string; challenge: TwoFactorChallenge; onSuccess: (result: AuthResponse) => void; onCancel: () => void }) {
    const { t } = useTranslation();
    const [code, setCode] = useState("");
    const [recovery, setRecovery] = useState(false);
    const validCode = recovery ? /^[a-f0-9]{32}$/i.test(code.replace(/-/g, "")) : /^\d{6}$/.test(code);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const verify = async () => {
        setBusy(true); setError("");
        try { onSuccess(await authApi.verifyTwoFactor(challenge, recovery ? { recovery_code: code } : { code })); }
        catch { setError(t("twoFactor.failed")); setCode(""); }
        finally { setBusy(false); }
    };
    return <div id={id} className={`${id} space-y-4`}>
        <p id={`${id}-help`} className={`${id}-help text-sm text-muted-foreground`}>{t("twoFactor.loginHelp")}</p>
        {error && <p id={`${id}-error`} className={`${id}-error text-sm text-destructive`} role="alert">{error}</p>}
        <label id={`${id}-label`} className={`${id}-label text-sm`} htmlFor={`${id}-code`}>{t(recovery ? "twoFactor.recoveryCode" : "twoFactor.code")}</label>
        <Input id={`${id}-code`} className={`${id}-code`} value={code} onChange={event => setCode(recovery ? event.target.value.replace(/[^a-f0-9-]/gi, "").toUpperCase().slice(0, 35) : event.target.value.replace(/\D/g, "").slice(0, 6))} autoComplete={recovery ? "off" : "one-time-code"} inputMode={recovery ? "text" : "numeric"} maxLength={recovery ? 35 : 6} autoFocus disabled={busy} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); if (!busy && validCode) void verify(); } }} />
        <Button id={`${id}-toggle`} className={`${id}-toggle`} type="button" disabled={busy} onClick={() => { setRecovery(!recovery); setCode(""); setError(""); }}>{t(recovery ? "twoFactor.useAuthenticator" : "twoFactor.useRecovery")}</Button>
        <Button id={`${id}-submit`} className={`${id}-submit`} type="button" disabled={busy || !validCode} onClick={verify}>{t("twoFactor.verify")}</Button>
        <Button id={`${id}-back`} className={`${id}-back`} type="button" disabled={busy} onClick={onCancel}>{t("twoFactor.back")}</Button>
    </div>;
}
