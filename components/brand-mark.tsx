import Link from "next/link";
import { SITE_NAME } from "@/lib/site-config";

export function BrandMark({ id }: { id: string }) {
  return (
    <Link id={id} href="/" className="group inline-flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img id={`${id}-logo`} src="/logo.png" alt="" width={32} height={32} className="size-8 rounded-md" />
      <span id={`${id}-name`} className="font-display text-lg font-bold tracking-wide">
        {SITE_NAME}
        <span id={`${id}-badge`} className="ml-1.5 align-middle text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
          Play
        </span>
      </span>
    </Link>
  );
}
