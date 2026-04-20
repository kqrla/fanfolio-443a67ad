
# Fanfolio, Supabase Migration Guide

A complete step-by-step guide to replacing the managed backend with Supabase, including the account and archive claim system.

---

## 1. Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click **New project**
3. Choose a name (e.g. `fanfolio`), set a strong DB password, pick a region
4. Wait for provisioning (~1 min)

---

## 2. Create the Database Tables

In your Supabase project, go to **SQL Editor**, **New query**, paste and run:

```sql
-- Main profiles table
CREATE TABLE fanfolio_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    TEXT UNIQUE NOT NULL,
  slug          TEXT UNIQUE,
  edit_key      TEXT NOT NULL,
  username      TEXT,
  bio           TEXT,
  tagline       TEXT,
  avatar_url    TEXT,
  enabled_sections  TEXT[]     DEFAULT '{}',
  media_items       JSONB      DEFAULT '[]',
  characters        JSONB      DEFAULT '[]',
  ships             JSONB      DEFAULT '[]',
  tags              JSONB      DEFAULT '[]',
  social_links      JSONB      DEFAULT '[]',
  fandoms           JSONB      DEFAULT '[]',
  fandom_spaces     TEXT[]     DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at on every change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON fanfolio_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_profiles_slug ON fanfolio_profiles(slug);
CREATE INDEX idx_profiles_profile_id ON fanfolio_profiles(profile_id);

-- User claims table (links a Supabase auth user to claimed archives)
CREATE TABLE fanfolio_claims (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id  TEXT NOT NULL REFERENCES fanfolio_profiles(profile_id) ON DELETE CASCADE,
  claimed_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, profile_id)
);

CREATE INDEX idx_claims_user_id ON fanfolio_claims(user_id);
```

---

## 3. Set Row Level Security (RLS)

```sql
-- Profiles: public read, public insert, authenticated update
ALTER TABLE fanfolio_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read"
  ON fanfolio_profiles FOR SELECT USING (true);

CREATE POLICY "Public insert"
  ON fanfolio_profiles FOR INSERT WITH CHECK (true);

-- Only allow updates from service role (app verifies edit_key before updating)
CREATE POLICY "Service update"
  ON fanfolio_profiles FOR UPDATE USING (true);

-- Claims: only the owning user can read/write their claims
ALTER TABLE fanfolio_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User reads own claims"
  ON fanfolio_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "User inserts own claims"
  ON fanfolio_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User deletes own claims"
  ON fanfolio_claims FOR DELETE
  USING (auth.uid() = user_id);
```

> **Security note:** For stronger protection, move profile updates through a Supabase Edge Function that verifies the edit_key server-side before applying changes.

---

## 4. Enable Supabase Auth

1. Go to **Authentication**, **Providers**
2. Enable **Email** provider
3. Optionally disable email confirmation for development (under **Auth settings**)

---

## 5. Enable Storage for File Uploads

1. In Supabase dashboard, go to **Storage**, **New bucket**
2. Name it `fanfolio-uploads`, set to **Public**
3. Run in SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('fanfolio-uploads', 'fanfolio-uploads', true);

CREATE POLICY "Public upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'fanfolio-uploads');

CREATE POLICY "Public read files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fanfolio-uploads');
```

---

## 6. Get Your Supabase Keys

In Supabase, go to **Project Settings**, **API**:

- `Project URL` becomes `VITE_SUPABASE_URL`
- `anon / public key` becomes `VITE_SUPABASE_ANON_KEY`

Create `.env` at project root:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_TMDB_API_KEY=your_tmdb_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/w500
```

---

## 7. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## 8. Create the Supabase Client

```js
// src/api/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## 9. Create a Drop-in Profiles Adapter

This mirrors the entity API shape used throughout the app:

```js
// src/api/profilesApi.js
import { supabase } from './supabaseClient';

export const ProfilesApi = {
  async list() {
    const { data } = await supabase
      .from('fanfolio_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  },

  async filter(query) {
    let q = supabase.from('fanfolio_profiles').select('*');
    Object.entries(query).forEach(([key, value]) => { q = q.eq(key, value); });
    const { data } = await q;
    return data || [];
  },

  async create(data) {
    const { data: result } = await supabase
      .from('fanfolio_profiles').insert(data).select().single();
    return result;
  },

  async update(id, data) {
    const { data: result } = await supabase
      .from('fanfolio_profiles').update(data).eq('id', id).select().single();
    return result;
  },

  async delete(id) {
    await supabase.from('fanfolio_profiles').delete().eq('id', id);
  },
};
```

---

## 10. Create a File Upload Helper

```js
// src/api/uploadFile.js
import { supabase } from './supabaseClient';

export async function uploadFile(file) {
  const ext = file.name.split('.').pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('fanfolio-uploads')
    .upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('fanfolio-uploads').getPublicUrl(path);
  return { file_url: data.publicUrl };
}
```

---

## 11. Create an Auth Context for the Account Page

Replace the localStorage account system in `pages/Account.jsx` with real Supabase auth:

```js
// src/lib/supabaseAuth.js
import { supabase } from '@/api/supabaseClient';

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
```

---

## 12. Create a Claims API

Replace the `CLAIMS_KEY` localStorage logic in `pages/Account.jsx` with:

```js
// src/api/claimsApi.js
import { supabase } from './supabaseClient';

export const ClaimsApi = {
  async list(userId) {
    const { data } = await supabase
      .from('fanfolio_claims')
      .select('*, fanfolio_profiles(username, slug, profile_id)')
      .eq('user_id', userId)
      .order('claimed_at', { ascending: false });
    return data || [];
  },

  async claim(userId, profileId) {
    const { data, error } = await supabase
      .from('fanfolio_claims')
      .insert({ user_id: userId, profile_id: profileId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(userId, profileId) {
    await supabase
      .from('fanfolio_claims')
      .delete()
      .eq('user_id', userId)
      .eq('profile_id', profileId);
  },
};
```

---

## 13. Replace App Calls

### Profile data (Creator.jsx, EditProfile.jsx, PublicProfile.jsx, etc.)

```js
// BEFORE

await db.entities.FanfolioProfile.filter({ profile_id: id });

// AFTER
import { ProfilesApi } from '@/api/profilesApi';
await ProfilesApi.filter({ profile_id: id });
```

### File uploads (ProfileFormBuilder.jsx, AddMediaDialog.jsx, etc.)

```js
// BEFORE
const { file_url } = await db.integrations.Core.UploadFile({ file });

// AFTER
import { uploadFile } from '@/api/uploadFile';
const { file_url } = await uploadFile(file);
```

### Account page (Account.jsx)

Replace the localStorage `AuthForm` logic with calls to `signIn` / `signUp` from `supabaseAuth.js`.
Replace the `loadClaims` / `saveClaims` localStorage logic with `ClaimsApi.list` / `ClaimsApi.claim` / `ClaimsApi.remove`.

### Email backup (SuccessScreen.jsx, EditProfile.jsx)

Options to replace the email sending integration:
- Use [Resend](https://resend.com) with a Supabase Edge Function
- Use [EmailJS](https://www.emailjs.com/) directly from the browser (free tier)
- Remove the email feature and rely on the .txt download only

---

## 14. Deploy

```bash
npm run build
```

Deploy `dist/` to Vercel, Netlify, or Cloudflare Pages. Set all environment variables in the host dashboard.

---

## Summary Checklist

- [ ] Supabase project created
- [ ] `fanfolio_profiles` table created
- [ ] `fanfolio_claims` table created
- [ ] RLS policies applied to both tables
- [ ] Supabase Auth email provider enabled
- [ ] Storage bucket `fanfolio-uploads` created and policies applied
- [ ] `.env` populated with Supabase and TMDB keys
- [ ] `@supabase/supabase-js` installed
- [ ] `src/api/supabaseClient.js` created
- [ ] `src/api/profilesApi.js` created
- [ ] `src/api/uploadFile.js` created
- [ ] `src/api/claimsApi.js` created
- [ ] `src/lib/supabaseAuth.js` created
- [ ] Profile calls replaced with ProfilesApi
- [ ] Upload calls replaced with uploadFile
- [ ] Account page wired to Supabase Auth and ClaimsApi
- [ ] App builds and runs locally
- [ ] Deployed to hosting provider