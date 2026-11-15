export const ACCOUNT_TABS = ["info", "security", "steam"] as const;

export type AccountTab = (typeof ACCOUNT_TABS)[number];

export const ACCOUNT_PATH = "/account";

/** Friendly URL of an account subtab: /account for Account info, /account/{tab} otherwise. */
export function accountTabHref(tab: AccountTab) {
  return tab === "info" ? ACCOUNT_PATH : `${ACCOUNT_PATH}/${tab}`;
}

export function parseAccountTab(value: string | undefined): AccountTab {
  return ACCOUNT_TABS.find((tab) => tab === value) ?? "info";
}

/** True for /account and any of its subtabs. */
export function isAccountPath(pathname: string) {
  return pathname === ACCOUNT_PATH || pathname.startsWith(`${ACCOUNT_PATH}/`);
}
