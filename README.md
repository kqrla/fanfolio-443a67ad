# Ocverse / Fanfolio

A fully portable React + Vite app for building public archives of fandoms, OCs,
ships, and media — backed entirely by your own Supabase project. Zero platform
lock-in.

## Quick start

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Supabase → Settings → API)

# 3. Provision the database
# In your Supabase SQL editor, paste & run the contents of supabase/schema.sql

# 4. Run
npm run dev      # http://localhost:8080
npm run build    # outputs static files to dist/
npm run preview  # preview production build
```

## Deploying

`dist/` is plain static HTML/JS — drop it on any host:

| Host                | Command / setup                                                |
|---------------------|----------------------------------------------------------------|
| Vercel              | `vercel --prod` (uses `vercel.json` for SPA fallback)          |
| Netlify             | `netlify deploy --prod --dir=dist` (uses `public/_redirects`)  |
| Cloudflare Pages    | Build cmd `npm run build`, output `dist`                       |
| GitHub Pages / S3   | Upload `dist/`, configure SPA fallback → `/index.html`         |

Set the same env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
optionally `VITE_TMDB_API_KEY`, `VITE_SITE_URL`) in the host's dashboard.

## Architecture

- **`src/api/supabaseClient.js`** — `@supabase/supabase-js` instance.
- **`src/api/base44Client.js`** — Backend adapter. Exposes the original
  `db.entities.*`, `db.auth.*`, `db.integrations.Core.*` interface used by
  components, now powered entirely by Supabase. Swap this one file to point at
  a different backend.
- **`src/lib/AuthContext.jsx`** — Supabase Auth provider with the same shape
  the rest of the app expects.
- **`supabase/schema.sql`** — Tables, RLS policies, storage bucket. Idempotent.

Original porting notes live in `PORTING.md` and `SUPABASE_SETUP.md`.

## What was removed

- `@base44/sdk`, `@base44/vite-plugin` — gone.
- All managed-platform URL params, app-id headers, hosted-auth redirects.
- The `lovable-tagger` Vite plugin — gone.

The app is now stock Vite + React + Tailwind + Supabase.
