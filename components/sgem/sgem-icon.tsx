import { cn } from "@/lib/utils";

/** sGem symbol, matching the Studio site (💎, blue-400). */
export function SgemIcon({ id, className }: { id: string; className?: string }) {
  return (
    <span id={id} aria-hidden className={cn("sgem-icon", "text-blue-400", className)}>
      💎
    </span>
  );
}
