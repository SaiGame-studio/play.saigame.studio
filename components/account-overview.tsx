"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BadgeCheck, MailWarning } from "lucide-react";
import { LanguageSelector } from "@/components/language-selector";
import { TwoFactorSettings } from "@/components/auth/two-factor-settings";
import { SteamLinkStatusCard } from "@/components/auth/steam-link-status";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { useAuth } from "@/contexts/auth-context";
import { ACCOUNT_TABS, accountTabHref, parseAccountTab, type AccountTab } from "@/lib/account-routes";
import { authApi } from "@/lib/auth-api";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cn } from "@/lib/utils";

const TAB_LABEL_KEYS: Record<AccountTab, string> = {
  info: "home.tabAccountInfo",
  security: "home.tabSecurity",
  steam: "home.tabSteam",
};

/** /account: the player's header and subtabs (kept in the path: /account/[tab]). */
export function AccountOverview() {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { section } = useParams<{ section?: string[] }>();
  const tab = parseAccountTab(section?.[0]);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  if (!user) {
    return null;
  }

  const name = user.display_name || user.username;
  const memberSince = new Date(user.created_at * 1000).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });

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
      <div id="account-overview-language" className="mb-6 sm:hidden">
        <LanguageSelector align="left" />
      </div>
      <header id="account-overview-header" className="mb-8 flex items-center gap-4">
        <div
          id="account-overview-avatar"
          aria-hidden
          className="flex size-14 items-center justify-center rounded-md bg-indigo font-display text-3xl font-extrabold uppercase text-foreground"
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div id="account-overview-heading">
          <h1 id="account-overview-title" className="font-display text-4xl font-extrabold uppercase leading-none">
            {t("home.greeting", { name })}
          </h1>
          <p id="account-overview-subtitle" className="text-muted-foreground">
            {t("home.subtitle")}
          </p>
        </div>
      </header>

      <div id="account-overview-tabs" role="tablist" aria-label={t("home.account")} className="account-overview-tabs mb-8 flex gap-1 overflow-x-auto border-b border-border">
        {ACCOUNT_TABS.map((key) => {
          const selected = tab === key;
          return (
            <button
              id={`account-overview-tab-${key}`}
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`account-overview-panel-${key}`}
              onClick={() => router.replace(accountTabHref(key), { scroll: false })}
              className={cn(
                "account-overview-tab relative shrink-0 px-3 pb-3 pt-1 font-display text-lg font-semibold uppercase tracking-[0.06em] transition-colors",
                "after:absolute after:inset-x-2 after:-bottom-px after:h-[3px] after:bg-primary after:transition-transform after:duration-200",
                selected ? "text-foreground after:scale-x-100" : "text-muted-foreground after:scale-x-0 hover:text-foreground",
              )}
            >
              {t(TAB_LABEL_KEYS[key])}
            </button>
          );
        })}
      </div>

      <div id={`account-overview-panel-${tab}`} role="tabpanel" aria-labelledby={`account-overview-tab-${tab}`} className="account-overview-panel max-w-3xl">
        {tab === "info" && (
          <article id="account-overview-details" className="account-overview-details rounded-md border border-border bg-card/70 p-6">
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
        )}
        {tab === "security" && <TwoFactorSettings id="account-two-factor" />}
        {tab === "steam" && <SteamLinkStatusCard id="account-steam-link" />}
      </div>
    </section>
  );
}
