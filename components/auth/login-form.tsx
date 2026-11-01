"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { OrDivider } from "@/components/auth/divider";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { authApi, type TwoFactorChallenge } from "@/lib/auth-api";
import { TwoFactorLogin } from "@/components/auth/two-factor-login";
import { useTranslation } from "@/lib/i18n/use-translation";

export function LoginForm() {
  const { completeLogin } = useAuth();
  const { t } = useTranslation();
  const registered = useSearchParams().get("registered") === "1";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await authApi.login(identifier.trim(), password);
      if ("challenge_token" in result) { setChallenge(result); setPassword(""); }
      else completeLogin(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (challenge) return <AuthShell id="login-2fa-shell" title={t("twoFactor.title")} subtitle={t("twoFactor.loginHelp")}>
    <TwoFactorLogin id="login-2fa" challenge={challenge} onSuccess={completeLogin} onCancel={() => setChallenge(null)} />
  </AuthShell>;

  return (
    <AuthShell
      id="login"
      title={t("login.title")}
      subtitle={t("login.subtitle")}
      footer={
        <>
          {t("login.noAccount")}{" "}
          <Link id="login-register-link" href="/register" className="font-semibold text-primary hover:underline">
            {t("login.createAccount")}
          </Link>
        </>
      }
    >
      <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
        {registered && <FormAlert id="login-registered-alert" tone="success" message={t("register.success")} />}
        {error && <FormAlert id="login-error-alert" tone="error" message={error} />}
        <Field id="login-identifier" label={t("login.identifier")}>
          <Input
            id="login-identifier"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </Field>
        <Field
          id="login-password"
          label={t("login.password")}
          action={
            <Link id="login-forgot-link" href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
              {t("login.forgot")}
            </Link>
          }
        >
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Button id="login-submit" type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("login.submitting") : t("login.submit")}
        </Button>
        <OrDivider id="login-divider" label={t("common.or")} />
        <GoogleSignIn id="login-google" text="signin_with" onError={setError} />
        <p id="login-sso-hint" className="text-center text-xs text-muted-foreground">
          {t("login.ssoHint")}
        </p>
      </form>
    </AuthShell>
  );
}
