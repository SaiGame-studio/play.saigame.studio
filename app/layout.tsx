import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Barlow_Condensed, Be_Vietnam_Pro } from "next/font/google";
import { Providers } from "@/components/providers";
import { SessionGate } from "@/components/session-gate";
import { SITE_NAME } from "@/lib/site-config";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

const body = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`dark ${display.variable} ${body.variable}`}>
      <body>
        <Providers>
          <SessionGate>{children}</SessionGate>
        </Providers>
      </body>
    </html>
  );
}
