export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
export const STUDIO_URL = process.env.NEXT_PUBLIC_STUDIO_URL ?? "https://server.saigame.studio";
export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "780968193083-p0c7vvsf864khtltmqk8pv82l6qoconn.apps.googleusercontent.com";

// Identifies this site to the API so issued tokens record which client they belong to.
export const CLIENT_ID_HEADER = "X-Client-ID";
export const CLIENT_ID = "sai-play";

export function requireApiUrl(): string {
  if (!API_URL) {
    throw new Error("API URL is not configured. Set NEXT_PUBLIC_API_URL.");
  }
  return API_URL;
}
