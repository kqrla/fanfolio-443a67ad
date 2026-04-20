const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

// Returns the canonical public base URL for profile links.
// In production this is the published app domain; in the builder preview
// window.location.origin would return the sandbox URL, so we hardcode the
// published domain here.
const PUBLISHED_DOMAIN = "https://ocverse.db.app";

export function getSiteUrl() {
  // If we're somehow on the real domain, use it; otherwise always use the published domain.
  const origin = typeof window !== "undefined" ? window.location.origin : PUBLISHED_DOMAIN;
  if (origin.includes("ocverse") || origin.includes("localhost")) return origin;
  return PUBLISHED_DOMAIN;
}