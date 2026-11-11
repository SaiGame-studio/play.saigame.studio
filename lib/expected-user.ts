import { readStorage, writeStorage } from "@/lib/safe-storage";

/**
 * Optional query parameter a game may add to any Sai Play link: the ID of the user signed in to the game.
 * When present, Sai Play warns if the web session belongs to a different user. Without it, nothing changes.
 */
export const EXPECTED_USER_PARAM = "game_expect_user";

// Per tab: the expectation survives sign-out/sign-in in this tab and ends when the tab closes.
const STORAGE_KEY = "sai-play.expected-user";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Moves a valid game_expect_user from the URL into this tab's storage, removes it from the URL, and returns the stored value. */
export function captureExpectedUser(): string | null {
  const url = new URL(window.location.href);
  const value = url.searchParams.get(EXPECTED_USER_PARAM)?.trim();
  if (value !== undefined) {
    url.searchParams.delete(EXPECTED_USER_PARAM);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    // Malformed values are ignored, so the page behaves as if the parameter were absent.
    if (UUID_PATTERN.test(value)) {
      writeStorage(STORAGE_KEY, value.toLowerCase(), "session");
    }
  }
  return readStorage(STORAGE_KEY, "session");
}

export function clearExpectedUser() {
  writeStorage(STORAGE_KEY, null, "session");
}
