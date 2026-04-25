// Portable backend adapter exposing the same interface the app already uses
// (db.entities, db.auth, db.integrations.Core), but backed by Supabase.
import { supabase, SUPABASE_CONFIGURED } from "./supabaseClient";

const TABLES = {
  FanfolioProfile: "fanfolio_profiles",
  MediaItem: "fanfolio_media_items",
  Character: "fanfolio_characters",
  Ship: "fanfolio_ships",
  FandomTag: "fanfolio_fandom_tags",
  ArtistAlbum: "fanfolio_artist_albums",
};

function makeEntity(table) {
  return {
    async list(orderArg = "-created_at", limit = 1000) {
      let column = "created_at";
      let ascending = true;
      if (typeof orderArg === "string" && orderArg.length) {
        if (orderArg.startsWith("-")) {
          ascending = false;
          column = orderArg.slice(1);
        } else {
          column = orderArg;
        }
        if (column === "created_date") column = "created_at";
      }
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(column, { ascending })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },

    async filter(query = {}, orderArg, limit = 1000) {
      let q = supabase.from(table).select("*");
      Object.entries(query).forEach(([k, v]) => {
        q = v === null ? q.is(k, null) : q.eq(k, v);
      });
      if (orderArg) {
        let column = orderArg;
        let ascending = true;
        if (orderArg.startsWith("-")) {
          ascending = false;
          column = orderArg.slice(1);
        }
        if (column === "created_date") column = "created_at";
        q = q.order(column, { ascending });
      }
      q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },

    async get(id) {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },

    async create(payload) {
      const { data, error } = await supabase.from(table).insert(payload).select().single();
      if (error) throw error;
      return data;
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return { ok: true };
    },
  };
}

const entities = Object.fromEntries(
  Object.entries(TABLES).map(([name, table]) => [name, makeEntity(table)])
);

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadFile({ file }) {
  if (!file) return { file_url: "" };

  // When storage isn't configured, skip the network call and embed directly.
  if (SUPABASE_CONFIGURED) {
    const ext = (file?.name || "bin").split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    try {
      const { error } = await supabase.storage
        .from("fanfolio-uploads")
        .upload(path, file, { upsert: false, contentType: file?.type, cacheControl: "3600" });
      if (error) throw error;
      const { data } = supabase.storage.from("fanfolio-uploads").getPublicUrl(path);
      if (data?.publicUrl) return { file_url: data.publicUrl };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[ocverse] Storage upload failed, embedding image as data URL.", err);
    }
  }

  // Fallback: embed the image as a data URL so the app still works
  // even when storage isn't configured. Cap at ~3 MB to keep payloads sane.
  if (file.size > 3 * 1024 * 1024) {
    throw new Error("Image too large (max 3 MB). Please configure Supabase storage or use a smaller image.");
  }
  const dataUrl = await fileToDataUrl(file);
  return { file_url: dataUrl };
}

async function sendEmail({ to, subject, body } = {}) {
  // Portable, no-backend approach: open the user's own mail client.
  // Honours the project ethos (no third-party email service required).
  if (typeof window === "undefined") return { ok: false };
  const url = `mailto:${encodeURIComponent(to || "")}?subject=${encodeURIComponent(subject || "")}&body=${encodeURIComponent(body || "")}`;
  window.location.href = url;
  return { ok: true, via: "mailto" };
}

export const db = {
  entities,
  integrations: {
    Core: {
      UploadFile: uploadFile,
      SendEmail: sendEmail,
      InvokeLLM: async () => {
        throw new Error("InvokeLLM not configured in this build.");
      },
    },
  },
  auth: {
    async me() {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      const u = data?.user;
      if (!u) {
        const err = new Error("Not authenticated");
        err.status = 401;
        throw err;
      }
      return {
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name || u.email,
        role: u.app_metadata?.role || "user",
      };
    },
    async isAuthenticated() {
      const { data } = await supabase.auth.getSession();
      return Boolean(data?.session);
    },
    async logout() {
      await supabase.auth.signOut();
    },
    redirectToLogin(returnUrl) {
      const url = new URL("/account", window.location.origin);
      if (returnUrl) url.searchParams.set("from", returnUrl);
      window.location.href = url.toString();
    },
    async updateMe(updates = {}) {
      const { data, error } = await supabase.auth.updateUser({ data: updates });
      if (error) throw error;
      return data?.user;
    },
  },
};

export const base44 = db;
export default db;

// Make available to legacy stub lines like:
//   const db = globalThis.__B44_DB__ || { ... };
if (typeof globalThis !== "undefined") {
  globalThis.__B44_DB__ = db;
}
