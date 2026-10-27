export const RETURN_TO_PARAM = "returnTo";

export const GUEST_ONLY_PATHS = ["/login", "/register", "/forgot-password"];

/** Only allow same-site relative paths to avoid open redirects. */
export function getSafeReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }
  const path = value.split(/[?#]/, 1)[0];
  return GUEST_ONLY_PATHS.includes(path) ? "/" : value;
}

export function getLoginUrl(returnTo: string): string {
  return `/login?${RETURN_TO_PARAM}=${encodeURIComponent(getSafeReturnTo(returnTo))}`;
}

export function getReturnToFromLocation(): string {
  if (typeof window === "undefined") {
    return "/";
  }
  return getSafeReturnTo(new URLSearchParams(window.location.search).get(RETURN_TO_PARAM));
}
