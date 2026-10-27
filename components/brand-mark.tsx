import Link from "next/link";
import { SITE_NAME } from "@/lib/site-config";

export function BrandMark({ id }: { id: string }) {
  return (
    <Link id={id} href="/" className="group inline-flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img id={`${id}-logo`} src="/logo.png" alt="" width={32} height={32} className="size-8 rounded-md" />
      <span id={`${id}-name`} className="hidden font-display text-lg font-bold tracking-wide sm:inline">
        {SITE_NAME}
      </span>
    </Link>
  );
}
