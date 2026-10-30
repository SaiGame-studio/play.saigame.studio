import type { ReactNode } from "react";
import { GameCoverArt } from "@/components/games/game-cover-art";

interface AuthShellProps {
  id: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Shared frame for sign-in, sign-up and password pages. */
export function AuthShell({ id, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <section id={id} className="relative flex flex-1 items-center justify-center px-4 py-10">
      <div id={`${id}-art`} aria-hidden className="auth-shell-art pointer-events-none absolute inset-0 opacity-60">
        <GameCoverArt id={`${id}-art-image`} seedKey="sai-play" cols={80} rows={45} />
      </div>
      <div id={`${id}-shade`} aria-hidden className="auth-shell-shade key-art-shade pointer-events-none absolute inset-0" />
      <div
        id={`${id}-card`}
        className="auth-shell-card relative w-full max-w-md rounded-md border border-border bg-card p-6 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.7)] sm:p-8"
      >
        <div id={`${id}-accent`} aria-hidden className="auth-shell-accent absolute inset-x-0 top-0 h-[3px] rounded-t-md bg-primary" />
        <header id={`${id}-header`} className="mb-6 space-y-1.5">
          <h1 id={`${id}-title`} className="auth-shell-title font-display text-4xl font-extrabold uppercase leading-none">
            {title}
          </h1>
          <p id={`${id}-subtitle`} className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        </header>
        {children}
        {footer && (
          <footer id={`${id}-footer`} className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </footer>
        )}
      </div>
    </section>
  );
}
