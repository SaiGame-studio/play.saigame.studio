import Link from "next/link";
import { SITE_NAME } from "@/lib/site-config";

export function BrandMark({ id }: { id: string }) {
  return (
    <Link id={id} href="/" className="brand-mark group inline-flex items-center gap-2.5 self-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img id={`${id}-logo`} src="/logo.png" alt="" width={32} height={32} className="brand-mark-logo size-8 [image-rendering:pixelated]" />
      <span id={`${id}-name`} className="brand-mark-name hidden font-display text-2xl font-extrabold uppercase leading-none tracking-[0.02em] sm:inline">
        {SITE_NAME}
      </span>
    </Link>
  );
}
