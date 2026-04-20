// No-op replacement for the legacy base44 app-params module.
export const appParams = {
  appId: "ocverse",
  token: null,
  fromUrl: typeof window !== "undefined" ? window.location.href : null,
  functionsVersion: null,
  appBaseUrl: typeof window !== "undefined" ? window.location.origin : null,
};
