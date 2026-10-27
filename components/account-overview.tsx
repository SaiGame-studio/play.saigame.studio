"use client";

import { useState } from "react";
import { BadgeCheck, MailWarning, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { useAuth } from "@/contexts/auth-context";
import { authApi } from "@/lib/auth-api";
import { useTranslation } from "@/lib/i18n/use-translation";

export function AccountOverview() {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  if (!user) {
    return null;
  }

  const name = user.display_name || user.username;
  const memberSince = new Date(user.created_at).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });

  const resend = async () => {
    setResendState("sending");
    try {
      await authApi.resendVerification();
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  };

  const rows = [
    { key: "username", label: t("home.username"), value: user.username },
    { key: "email", label: t("home.email"), value: user.email },
    { key: "member-since", label: t("home.memberSince"), value: memberSince },
  ];

  return (
    <section id="account-overview" className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      <header id="account-overview-header" className="mb-8 flex items-center gap-4">
        <div
          id="account-overview-avatar"
          aria-hidden
          className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent font-display text-2xl font-bold text-primary-foreground"
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div id="account-overview-heading">
          <h1 id="account-overview-title" className="font-display text-3xl font-bold tracking-tight">
            {t("home.greeting", { name })}
          </h1>
          <p id="account-overview-subtitle" className="text-muted-foreground">
            {t("home.subtitle")}
          </p>
        </div>
      </header>

      <div id="account-overview-grid" className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <article id="account-overview-details" className="rounded-2xl border border-border bg-card/70 p-6">
          <h2 id="account-overview-details-title" className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t("home.account")}
          </h2>
          <dl id="account-overview-details-list" className="divide-y divide-border">
            {rows.map((row) => (
              <div id={`account-overview-row-${row.key}`} key={row.key} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <dt id={`account-overview-row-${row.key}-label`} className="text-muted-foreground">
                  {row.label}
                </dt>
                <dd id={`account-overview-row-${row.key}-value`} className="font-medium">
                  {row.value}
                </dd>
              </div>
            ))}
            <div id="account-overview-row-status" className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <dt id="account-overview-row-status-label" className="text-muted-foreground">
                {t("home.status")}
              </dt>
              <dd id="account-overview-row-status-value" className="flex items-center gap-1.5 font-medium">
                {user.is_verified ? (
                  <>
                    <BadgeCheck id="account-overview-verified-icon" className="size-4 text-primary" aria-hidden />
                    {t("home.verified")}
                  </>
                ) : (
                  <>
                    <MailWarning id="account-overview-unverified-icon" className="size-4 text-destructive" aria-hidden />
                    {t("home.notVerified")}
                  </>
                )}
              </dd>
            </div>
          </dl>
          {!user.is_verified && (
            <div id="account-overview-verify" className="mt-4 space-y-3">
              {resendState === "sent" && <FormAlert id="account-overview-resend-sent" tone="success" message={t("home.resendSent")} />}
              {resendState === "error" && <FormAlert id="account-overview-resend-error" tone="error" message={t("home.resendFailed")} />}
              <Button id="account-overview-resend" variant="outline" size="sm" onClick={resend} disabled={resendState === "sending" || resendState === "sent"}>
                {t("home.resend")}
              </Button>
            </div>
          )}
        </article>

        <aside id="account-overview-sso" className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <Link2 id="account-overview-sso-icon" className="mb-3 size-6 text-primary" aria-hidden />
          <h2 id="account-overview-sso-title" className="mb-2 font-display text-lg font-semibold">
            {t("home.ssoTitle")}
          </h2>
          <p id="account-overview-sso-body" className="text-sm text-muted-foreground">
            {t("home.ssoBody")}
          </p>
        </aside>
      </div>
    </section>
  );
}
