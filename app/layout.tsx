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
  // Social previews need absolute image URLs.
  metadataBase: new URL("https://play.saigame.studio"),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "One account for every game: your games, progress, items, game shops and one sGem balance.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: "One account for every game: your games, progress, items, game shops and one sGem balance.",
    // Built by saigame.studio/tools/build-app-og-images.mjs
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${SITE_NAME} - One account for every game.` }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "One account for every game: your games, progress, items, game shops and one sGem balance.",
    images: ["/og-image.png"],
  },
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
