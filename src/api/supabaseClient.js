import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[ocverse] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
      "Copy .env.example to .env and fill in your Supabase project keys."
  );
}

export const supabase = createClient(url ?? "http://localhost", anonKey ?? "anon", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export const SUPABASE_CONFIGURED = Boolean(url && anonKey);
