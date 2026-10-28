import { cn } from "@/lib/utils";

const SGEM_ICON_SRC = "/icons/sgem.svg";

/** sGem symbol, matching the Studio site (public/icons/sgem.svg). Sized by font-size (1em). */
export function SgemIcon({ id, className }: { id: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG icon; next/image adds no value here
    <img
      id={id}
      src={SGEM_ICON_SRC}
      alt=""
      aria-hidden
      draggable={false}
      className={cn("sgem-icon", "inline-block h-[1em] w-[1em] shrink-0 align-[-0.125em]", className)}
    />
  );
}
