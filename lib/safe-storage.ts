/** localStorage/sessionStorage access that never throws (private mode, blocked storage). */
type Store = "local" | "session";

function getStore(store: Store): Storage | null {
  try {
    return store === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStorage(key: string, store: Store = "local"): string | null {
  try {
    return getStore(store)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string | null, store: Store = "local") {
  try {
    const target = getStore(store);
    if (value === null) {
      target?.removeItem(key);
    } else {
      target?.setItem(key, value);
    }
  } catch {
    // Ignore storage errors; these values are conveniences only.
  }
}
