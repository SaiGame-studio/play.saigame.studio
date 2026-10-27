"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { OrDivider } from "@/components/auth/divider";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/auth-api";
import { useTranslation } from "@/lib/i18n/use-translation";

export function RegisterForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(t("register.mismatch"));
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.register(email.trim(), username.trim(), password);
      router.push("/login?registered=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("register.failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      id="register"
      title={t("register.title")}
      subtitle={t("register.subtitle")}
      footer={
        <>
          {t("register.haveAccount")}{" "}
          <Link id="register-login-link" href="/login" className="font-semibold text-primary hover:underline">
            {t("register.signIn")}
          </Link>
        </>
      }
    >
      <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <FormAlert id="register-error-alert" tone="error" message={error} />}
        <Field id="register-email" label={t("register.email")}>
          <Input id="register-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field id="register-username" label={t("register.username")}>
          <Input
            id="register-username"
            autoComplete="username"
            minLength={3}
            maxLength={50}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Field>
        <Field id="register-password" label={t("register.password")}>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Field id="register-confirm-password" label={t("register.confirmPassword")}>
          <Input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Field>
        <Button id="register-submit" type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("register.submitting") : t("register.submit")}
        </Button>
        <OrDivider id="register-divider" label={t("common.or")} />
        <GoogleSignIn id="register-google" text="signup_with" onError={setError} />
      </form>
    </AuthShell>
  );
}
