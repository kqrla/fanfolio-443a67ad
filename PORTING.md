
# Fanfolio, Local Development and Porting Guide

Everything you need to run Fanfolio locally or self-host it outside of the managed platform.

---

## Prerequisites

- **Node.js 18+** — https://nodejs.org
- **npm** (comes with Node) or **pnpm** (`npm i -g pnpm`)
- **TMDB API key** (free) — https://developer.themoviedb.org/

---

## 1. Project Structure

```
fanfolio/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── src/
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    ├── api/
    │   └── base44Client.js       ← replace with your db adapter
    ├── components/
    │   ├── fanfolio/             ← all app-specific components
    │   └── ui/                   ← shadcn/ui components (keep as-is)
    ├── entities/                 ← JSON schemas (reference for DB tables)
    ├── hooks/
    │   └── useTmdbSearch.js      ← reads VITE_TMDB_API_KEY
    ├── lib/
    │   ├── AuthContext.jsx       ← managed auth, stub for local
    │   └── site-url.js           ← update PRODUCTION_DOMAIN
    ├── pages/
    │   ├── Creator.jsx           ← new archive wizard
    │   ├── EditProfile.jsx       ← key-gated profile editor
    │   ├── PublicProfile.jsx     ← public read-only view
    │   ├── MediaDetailPage.jsx   ← per-item detail/notes page
    │   ├── Account.jsx           ← login and claim dashboard
    │   ├── Landing.jsx           ← marketing landing page
    │   ├── Features.jsx          ← feature breakdown page
    │   └── FAQ.jsx               ← faq accordion page
    └── utils/
        └── exportProfileHtml.js  ← ZIP export, works locally unchanged
```

---

## 2. Install Dependencies

```bash
npm install
```

All UI packages (`@radix-ui/*`, `framer-motion`, `lucide-react`, etc.) are standard npm packages and install normally.

---

## 3. Environment Variables

Create `.env` in the project root:

```env
VITE_TMDB_API_KEY=your_tmdb_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/w500
```

Get a free TMDB API key at https://developer.themoviedb.org/docs/getting-started.

---

## 4. Update the Site URL

Edit `src/lib/site-url.js` and change `PRODUCTION_DOMAIN` to your own domain:

```js
const PRODUCTION_DOMAIN = "https://your-domain.com";
```

---

## 5. Replace the Backend Adapter

The app calls `db.entities.FanfolioProfile.*` for all data storage, and `db.integrations.Core.UploadFile` / `SendEmail` for integrations. Replace these with your own backend.

### Option A, localStorage (fastest, zero setup)

Create `src/api/localDb.js`:

```js
const store = (key) => ({
  list: () => JSON.parse(localStorage.getItem(key) || "[]"),
  filter: (query) =>
    store(key).list().filter((r) =>
      Object.entries(query).every(([k, v]) => r[k] === v)
    ),
  create: (data) => {
    const records = store(key).list();
    const record = { ...data, id: crypto.randomUUID(), created_date: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify([...records, record]));
    return record;
  },
  update: (id, data) => {
    const records = store(key).list().map((r) => (r.id === id ? { ...r, ...data } : r));
    localStorage.setItem(key, JSON.stringify(records));
  },
  delete: (id) => {
    localStorage.setItem(key, JSON.stringify(store(key).list().filter((r) => r.id !== id)));
  },
});

export const localEntities = {
  FanfolioProfile: store("fanfolio_profiles"),
};
```

Then replace `src/api/base44Client.js`:

```js
import { localEntities } from "./localDb";

export const base44 = {
  entities: localEntities,
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ file_url: e.target.result });
          reader.readAsDataURL(file);
        });
      },
      SendEmail: async () => {
        console.warn("SendEmail not configured locally, copy the edit key manually.");
      },
      InvokeLLM: async () => { throw new Error("InvokeLLM not available locally"); },
    },
  },
  auth: {
    me: async () => ({ id: "local", email: "local@fanfolio.app", full_name: "Local User", role: "admin" }),
    isAuthenticated: async () => true,
    logout: () => {},
    redirectToLogin: () => {},
    updateMe: async () => {},
  },
  users: {
    inviteUser: async () => {},
  },
};
```

### Option B, Supabase (recommended for production)

See `supabaseport.md` for a full step-by-step Supabase migration guide including:
- SQL schema for `fanfolio_profiles`
- Row Level Security policies
- Storage bucket for image uploads
- Account and claim system integration

### Option C, Any REST API, Firebase, or PocketBase

Wrap any backend in the same interface shape as `localEntities` above (list, filter, create, update, delete) and swap in `base44Client.js`.

---

## 6. Account System

The `/account` page (`pages/Account.jsx`) currently uses `localStorage` for account storage as a local-only demo. For production:

- Replace the `getAccounts()` / `saveAccount()` localStorage logic with real auth (Supabase Auth, Firebase Auth, etc.)
- The `CLAIMS_KEY` localStorage store (claimed archives list) maps to a `user_claims` table in a real DB
- The claim flow calls `db.entities.FanfolioProfile.filter` to verify the edit key, then stores the claim locally. In production this lookup should go through your db adapter.

---

## 7. Stub Auth

`src/lib/AuthContext.jsx` uses a managed auth SDK. For local dev, the simplest approach is to replace `App.jsx`'s `<AuthProvider>` wrapper:

```jsx
const AuthContext = React.createContext({ isLoadingAuth: false, isLoadingPublicSettings: false });
export const useAuth = () => React.useContext(AuthContext);

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <Routes>
          {/* your routes */}
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
```

---

## 8. Run Locally

```bash
npm run dev
```

Open http://localhost:5173

---

## 9. Build and Deploy

```bash
npm run build     # outputs to dist/
npm run preview   # preview production build locally
```

Deploy `dist/` to any static host:

| Host | Command |
|------|---------|
| **Vercel** | `vercel --prod` or connect GitHub repo |
| **Netlify** | `netlify deploy --prod --dir=dist` |
| **Cloudflare Pages** | Connect repo, build cmd: `npm run build`, output: `dist` |
| **GitHub Pages** | Use `gh-pages` package or Actions to push `dist/` |

Add a `_redirects` file (Netlify) or `vercel.json` rewrite so all routes fall back to `index.html` (required for React Router):

**Netlify** `public/_redirects`:
```
/* /index.html 200
```

**Vercel** `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 10. Key Files Reference

| File | What it does | Local action needed |
|------|-------------|---------------------|
| `src/api/base44Client.js` | SDK init, all DB/upload/email calls | **Replace** with local version |
| `src/lib/AuthContext.jsx` | Auth provider | **Stub** or remove |
| `src/lib/site-url.js` | Canonical URL for profile links | **Update** `PRODUCTION_DOMAIN` |
| `src/hooks/useTmdbSearch.js` | TMDB autocomplete | Set `VITE_TMDB_API_KEY` in `.env` |
| `src/utils/exportProfileHtml.js` | ZIP export utility | Works as-is |
| `src/pages/Account.jsx` | Account and claim system | Wire to real auth for production |
| `entities/*.json` | DB schemas | Reference for your own tables |
| `src/components/ui/*` | shadcn/ui components | Works as-is |

---

## 11. Vite Config

Make sure `vite.config.js` exists with at minimum:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

The `@/` alias is used throughout the codebase for imports.

---

## Notes

- **Dark mode** persists in `localStorage` under key `fanfolio-dark`. No server changes needed.
- **Edit keys** are generated client-side with `crypto.randomUUID()`. Secure and portable.
- **Account system** uses `localStorage` for accounts and claims in the default build. Swap with Supabase Auth for production.
- **Profile IDs** are short random alphanumeric strings (`generateId(6)`). Works with any backend.
- **No build-time secrets** only `VITE_TMDB_API_KEY` is required and it is a read-only public API key, safe to expose in client-side code.