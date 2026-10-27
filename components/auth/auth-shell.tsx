import type { ReactNode } from "react";

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
      <div id={`${id}-grid`} aria-hidden className="play-grid-overlay pointer-events-none absolute inset-0" />
      <div
        id={`${id}-card`}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card/80 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8"
      >
        <div id={`${id}-accent`} aria-hidden className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <header id={`${id}-header`} className="mb-6 space-y-1.5">
          <h1 id={`${id}-title`} className="font-display text-2xl font-bold tracking-tight">
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
