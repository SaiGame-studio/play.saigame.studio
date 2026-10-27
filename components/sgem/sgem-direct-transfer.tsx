"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2, Loader2 } from "lucide-react";
import { SgemIcon } from "@/components/sgem/sgem-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { useTranslation } from "@/lib/i18n/use-translation";
import { sgemApi, type SgemPackage } from "@/lib/sgem-api";
import { formatMinorMoney } from "@/lib/sgem-price";

const QR_CODES = [
  { key: "momo", label: "MoMo", src: "/momo-qr.jpg" },
  { key: "techcombank", label: "Techcombank", src: "/tech-qa.jpg" },
];

export function SgemDirectTransfer() {
  const packageId = useSearchParams().get("package_id");
  const { t, locale } = useTranslation();
  const [pkg, setPkg] = useState<SgemPackage | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [note, setNote] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [transferred, setTransferred] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!packageId) {
      setLoadState("error");
      return;
    }
    sgemApi
      .getPackage(packageId)
      .catch(async () => {
        const found = (await sgemApi.listPackages()).find((p) => p.id === packageId);
        if (!found) throw new Error("Package not found");
        return found;
      })
      .then((found) => {
        setPkg(found);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, [packageId]);

  const submit = async () => {
    if (!pkg || !understood || !transferred || !note.trim()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await sgemApi.initiateDirectTransfer(pkg.package_key);
      const txId = res.transaction?.id;
      if (!txId) throw new Error("No transaction returned");
      await sgemApi.confirmDirectTransfer(txId, note.trim());
      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="direct-transfer-success" className="flex flex-1 items-center justify-center px-4 py-16">
        <div id="direct-transfer-success-body" className="max-w-md space-y-4 text-center">
          <CheckCircle2 id="direct-transfer-success-icon" className="mx-auto size-14 text-primary" aria-hidden />
          <h1 id="direct-transfer-success-title" className="font-display text-2xl font-bold">
            {t("directTransfer.submitSuccess")}
          </h1>
          <p id="direct-transfer-success-description" className="text-sm text-muted-foreground">
            {t("directTransfer.submitSuccessDesc")}
          </p>
          <Link id="direct-transfer-success-back" href="/sgem" className={buttonVariants({ variant: "outline" })}>
            {t("checkout.back")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="direct-transfer" className="mx-auto flex w-full max-w-5xl flex-col items-start gap-8 px-4 py-10 lg:flex-row">
      <div id="direct-transfer-main" className="w-full space-y-6 lg:flex-1">
        <header id="direct-transfer-header" className="flex items-center gap-4">
          <Link id="direct-transfer-back" href="/sgem" aria-label={t("checkout.back")} className={buttonVariants({ variant: "outline", size: "icon" })}>
            <ArrowLeft id="direct-transfer-back-icon" aria-hidden />
          </Link>
          <div id="direct-transfer-heading">
            <h1 id="direct-transfer-title" className="font-display text-xl font-bold md:text-2xl">
              {t("directTransfer.title")}
            </h1>
            <p id="direct-transfer-subtitle" className="text-sm text-muted-foreground">
              {t("directTransfer.subtitle")}
            </p>
          </div>
        </header>

        <div id="direct-transfer-package" className="rounded-2xl border border-border bg-card/70 p-5">
          <p id="direct-transfer-package-title" className="mb-4 flex items-center gap-2 font-semibold">
            <Building2 id="direct-transfer-package-icon" className="size-4 text-primary" aria-hidden />
            {t("directTransfer.packageInfo")}
          </p>
          {loadState === "loading" ? (
            <Loader2 id="direct-transfer-package-loading" className="size-5 animate-spin text-muted-foreground" aria-hidden />
          ) : loadState === "error" || !pkg ? (
            <p id="direct-transfer-package-error" className="text-sm text-destructive">
              {t("directTransfer.packageNotFound")}
            </p>
          ) : (
            <div id="direct-transfer-package-details" className="space-y-4">
              <div id="direct-transfer-package-text">
                <p id="direct-transfer-package-name" className="font-semibold">
                  {pkg.name}
                </p>
                <p id="direct-transfer-package-description" className="text-sm text-muted-foreground">
                  {pkg.description}
                </p>
              </div>
              <div id="direct-transfer-package-totals" className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div id="direct-transfer-total-amount">
                  <p id="direct-transfer-total-amount-label" className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("directTransfer.totalAmount")}
                  </p>
                  <p id="direct-transfer-total-amount-value" className="font-display text-2xl font-bold text-primary">
                    {formatMinorMoney(pkg.price_amount, pkg.price_currency)}
                  </p>
                </div>
                <div id="direct-transfer-total-sgem">
                  <p id="direct-transfer-total-sgem-label" className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("directTransfer.totalSgem")}
                  </p>
                  <p id="direct-transfer-total-sgem-value" className="flex items-center gap-1.5 font-display text-2xl font-bold">
                    {pkg.sgem_amount.toLocaleString(locale)}
                    <SgemIcon id="direct-transfer-total-sgem-icon" className="text-sm" />
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {loadState === "ready" && pkg && (
          <div id="direct-transfer-form" className="space-y-5 rounded-2xl border border-border bg-card/70 p-5">
            <div id="direct-transfer-note-field" className="space-y-1.5">
              <label id="direct-transfer-note-label" htmlFor="direct-transfer-note" className="text-sm font-medium">
                {t("directTransfer.noteLabel")} <span className="text-destructive">*</span>
              </label>
              <textarea
                id="direct-transfer-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("directTransfer.notePlaceholder")}
                rows={3}
                disabled={isSubmitting}
                className="w-full resize-none rounded-md border border-input bg-background/70 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              {!note.trim() && (
                <p id="direct-transfer-note-required" className="text-xs text-destructive">
                  {t("directTransfer.noteRequired")}
                </p>
              )}
            </div>
            {[
              { key: "understood", checked: understood, set: setUnderstood, label: t("directTransfer.confirmLabel") },
              { key: "transferred", checked: transferred, set: setTransferred, label: t("directTransfer.transferredLabel") },
            ].map((item) => (
              <label id={`direct-transfer-${item.key}`} key={item.key} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
                <input
                  id={`direct-transfer-${item.key}-checkbox`}
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.set(e.target.checked)}
                  disabled={isSubmitting}
                  className="mt-1 size-4 accent-[hsl(var(--primary))]"
                />
                <span id={`direct-transfer-${item.key}-text`}>{item.label}</span>
              </label>
            ))}
            {submitError && <FormAlert id="direct-transfer-error" tone="error" message={`${t("directTransfer.submitFailed")} ${submitError}`} />}
            <Button id="direct-transfer-submit" className="w-full" disabled={!understood || !transferred || !note.trim() || isSubmitting} onClick={() => void submit()}>
              {isSubmitting && <Loader2 id="direct-transfer-submit-spinner" className="animate-spin" aria-hidden />}
              {isSubmitting ? t("directTransfer.submitting") : t("directTransfer.createTransfer")}
            </Button>
          </div>
        )}
      </div>

      <aside id="direct-transfer-qr" className="w-full space-y-3 lg:sticky lg:top-24 lg:w-auto">
        {QR_CODES.map((qr) => (
          <div id={`direct-transfer-qr-${qr.key}`} key={qr.key} className="rounded-2xl border border-border bg-card/70 p-3">
            <p id={`direct-transfer-qr-${qr.key}-label`} className="mb-2 text-center text-sm font-semibold">
              {qr.label}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img id={`direct-transfer-qr-${qr.key}-image`} src={qr.src} alt={`${qr.label} QR`} width={220} height={220} className="mx-auto rounded-lg" />
          </div>
        ))}
        <p id="direct-transfer-qr-hint" className="text-center text-xs text-muted-foreground">
          {t("directTransfer.qrHint")}
        </p>
      </aside>
    </section>
  );
}
