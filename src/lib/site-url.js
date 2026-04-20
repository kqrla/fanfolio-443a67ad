// Returns the canonical public base URL for sharable profile links.
// Override at build time with VITE_SITE_URL. Falls back to window.location.origin.
export function getSiteUrl() {
  const envUrl = import.meta.env.VITE_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}
