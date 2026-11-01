"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/contexts/auth-context";
import { authApi, type TwoFactorChallenge } from "@/lib/auth-api";
import { TwoFactorLogin } from "@/components/auth/two-factor-login";
import { useTranslation } from "@/lib/i18n/use-translation";

interface GoogleSignInProps {
  id: string;
  text: "signin_with" | "signup_with";
  onError: (message: string) => void;
}

export function GoogleSignIn({ id, text, onError }: GoogleSignInProps) {
  const { completeLogin } = useAuth();
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => setWidth(Math.min(400, Math.floor(entry.contentRect.width))));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleSuccess = async (credential: CredentialResponse) => {
    if (!credential.credential) {
      onError(t("login.googleFailed"));
      return;
    }
    try {
      const result = await authApi.googleLogin(credential.credential);
      if ("challenge_token" in result) setChallenge(result);
      else completeLogin(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : t("login.googleFailed"));
    }
  };

  if (challenge) return <TwoFactorLogin id={`${id}-2fa`} challenge={challenge} onSuccess={completeLogin} onCancel={() => setChallenge(null)} />;

  return (
    <div id={id} ref={containerRef} className="flex w-full justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError(t("login.googleFailed"))}
        theme="filled_black"
        size="large"
        shape="rectangular"
        text={text}
        width={width}
      />
    </div>
  );
}
