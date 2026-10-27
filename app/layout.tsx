import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Be_Vietnam_Pro, Chakra_Petch } from "next/font/google";
import { Providers } from "@/components/providers";
import { SessionGate } from "@/components/session-gate";
import { SITE_NAME } from "@/lib/site-config";
import "./globals.css";

const display = Chakra_Petch({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} Play`, template: `%s | ${SITE_NAME} Play` },
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
