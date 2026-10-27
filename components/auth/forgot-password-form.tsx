"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/auth-api";
import { useTranslation } from "@/lib/i18n/use-translation";

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      setStatus("sent");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      id="forgot-password"
      title={t("forgot.title")}
      subtitle={t("forgot.subtitle")}
      footer={
        <Link id="forgot-password-back-link" href="/login" className="font-semibold text-primary hover:underline">
          {t("forgot.back")}
        </Link>
      }
    >
      <form id="forgot-password-form" onSubmit={handleSubmit} className="space-y-4">
        {status === "sent" && <FormAlert id="forgot-password-sent-alert" tone="success" message={t("forgot.sent")} />}
        {status === "error" && <FormAlert id="forgot-password-error-alert" tone="error" message={t("forgot.failed")} />}
        <Field id="forgot-password-email" label={t("forgot.email")}>
          <Input id="forgot-password-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Button id="forgot-password-submit" type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("forgot.submitting") : t("forgot.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}
