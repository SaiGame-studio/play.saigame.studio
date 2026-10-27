import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadStateProps {
  id: string;
  state: "loading" | "error" | "ready";
  isEmpty: boolean;
  errorText: string;
  emptyText: string;
  retryText: string;
  onRetry: () => void;
  children: ReactNode;
}

/** Renders a spinner, an error with retry, an empty message, or the content. */
export function LoadState({ id, state, isEmpty, errorText, emptyText, retryText, onRetry, children }: LoadStateProps) {
  if (state === "loading") {
    return (
      <div id={`${id}-loading`} className="flex justify-center py-10">
        <Loader2 id={`${id}-loading-icon`} className="size-6 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }
  if (state === "error") {
    return (
      <div id={`${id}-error`} className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/60 py-8 text-center">
        <p id={`${id}-error-text`} className="text-sm text-destructive">
          {errorText}
        </p>
        <Button id={`${id}-retry`} variant="outline" size="sm" onClick={onRetry}>
          {retryText}
        </Button>
      </div>
    );
  }
  if (isEmpty) {
    return (
      <p id={`${id}-empty`} className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }
  return <>{children}</>;
}
