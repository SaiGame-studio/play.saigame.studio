"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { captureExpectedUser, clearExpectedUser } from "@/lib/expected-user";

/** The user ID a game asked this tab to use (via ?game_expect_user=), or null when none was given. */
export function useExpectedUser() {
  const pathname = usePathname();
  const [expectedUserId, setExpectedUserId] = useState<string | null>(null);

  useEffect(() => {
    setExpectedUserId(captureExpectedUser());
  }, [pathname]);

  const dismiss = useCallback(() => {
    clearExpectedUser();
    setExpectedUserId(null);
  }, []);

  return { expectedUserId, dismiss };
}
