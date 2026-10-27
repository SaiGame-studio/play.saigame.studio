"use client";

import type { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/contexts/auth-context";
import { ConfirmProvider } from "@/contexts/confirm-context";
import { GOOGLE_CLIENT_ID } from "@/lib/config";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <ConfirmProvider>
          <AuthProvider>{children}</AuthProvider>
        </ConfirmProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  );
}
