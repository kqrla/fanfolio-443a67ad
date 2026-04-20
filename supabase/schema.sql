-- Ocverse / Fanfolio — Supabase schema
-- Run this once in your Supabase project's SQL Editor.

-- =========================================================================
-- 1. Profiles (the only table the app strictly needs)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.fanfolio_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      TEXT UNIQUE NOT NULL,
  slug            TEXT UNIQUE,
  edit_key        TEXT NOT NULL,
  username        TEXT,
  bio             TEXT,
  tagline         TEXT,
  avatar_url      TEXT,
  enabled_sections TEXT[] DEFAULT '{}',
  media_items     JSONB DEFAULT '[]'::jsonb,
  characters      JSONB DEFAULT '[]'::jsonb,
  ships           JSONB DEFAULT '[]'::jsonb,
  tags            JSONB DEFAULT '[]'::jsonb,
  social_links    JSONB DEFAULT '[]'::jsonb,
  fandoms         JSONB DEFAULT '[]'::jsonb,
  fandom_spaces   TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_slug       ON public.fanfolio_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_id ON public.fanfolio_profiles(profile_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fanfolio_profiles_updated ON public.fanfolio_profiles;
CREATE TRIGGER trg_fanfolio_profiles_updated
  BEFORE UPDATE ON public.fanfolio_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- 2. Optional auxiliary tables (used by the /Profile admin view)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.fanfolio_media_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type   TEXT NOT NULL,
  title        TEXT NOT NULL,
  image_url    TEXT,
  subtitle     TEXT,
  link         TEXT,
  "order"      NUMERIC,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fanfolio_characters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  source      TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fanfolio_ships (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fanfolio_fandom_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  tag_type   TEXT NOT NULL CHECK (tag_type IN ('trope','genre','ao3','arc')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fanfolio_artist_albums (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_name TEXT NOT NULL,
  album_name  TEXT NOT NULL,
  album_cover TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- 3. Row Level Security
-- =========================================================================
ALTER TABLE public.fanfolio_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanfolio_media_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanfolio_characters    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanfolio_ships         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanfolio_fandom_tags   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanfolio_artist_albums ENABLE ROW LEVEL SECURITY;

-- Profiles: world-readable archive, anyone can create, anyone can update
-- (the app verifies the edit_key client-side before issuing updates).
-- For stricter security wrap updates in an Edge Function that checks edit_key.
DROP POLICY IF EXISTS "profiles read"   ON public.fanfolio_profiles;
DROP POLICY IF EXISTS "profiles insert" ON public.fanfolio_profiles;
DROP POLICY IF EXISTS "profiles update" ON public.fanfolio_profiles;
CREATE POLICY "profiles read"   ON public.fanfolio_profiles FOR SELECT USING (true);
CREATE POLICY "profiles insert" ON public.fanfolio_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles update" ON public.fanfolio_profiles FOR UPDATE USING (true) WITH CHECK (true);

-- Aux tables: open read, authenticated write (used in admin views).
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['fanfolio_media_items','fanfolio_characters','fanfolio_ships','fanfolio_fandom_tags','fanfolio_artist_albums']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%1$s read"   ON public.%1$s;', t);
    EXECUTE format('DROP POLICY IF EXISTS "%1$s write"  ON public.%1$s;', t);
    EXECUTE format('CREATE POLICY "%1$s read"  ON public.%1$s FOR SELECT USING (true);', t);
    EXECUTE format('CREATE POLICY "%1$s write" ON public.%1$s FOR ALL USING (true) WITH CHECK (true);', t);
  END LOOP;
END$$;

-- =========================================================================
-- 4. Storage bucket for uploaded images
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('fanfolio-uploads', 'fanfolio-uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public upload"     ON storage.objects;
DROP POLICY IF EXISTS "Public read files" ON storage.objects;
CREATE POLICY "Public upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'fanfolio-uploads');
CREATE POLICY "Public read files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fanfolio-uploads');
