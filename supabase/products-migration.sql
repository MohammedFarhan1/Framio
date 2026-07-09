-- ============================================================
-- Framio Products Migration
-- Run this in Supabase SQL Editor → New Query
-- Each BEGIN/COMMIT block is independent — if one deadlocks, retry it.
-- ============================================================

SET lock_timeout = '10s';

-- ── Block 1: Add missing columns ──────────────────────────────
BEGIN;

ALTER TABLE products ADD COLUMN IF NOT EXISTS description      TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge            TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS type             TEXT    DEFAULT 'single';
ALTER TABLE products ADD COLUMN IF NOT EXISTS photo_slots      INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active        BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS images           TEXT[]  DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS occasion         TEXT[]  DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title        TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description  TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity   INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT NOW();

COMMIT;

-- ── Block 2: Status column + check constraint ─────────────────
BEGIN;

ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Backfill any NULLs so the constraint can be validated
UPDATE products SET status = 'draft' WHERE status IS NULL;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check
  CHECK (status IN ('draft', 'published', 'archived')) NOT VALID;

-- Validate without a full table lock (safe on tables with existing rows)
ALTER TABLE products VALIDATE CONSTRAINT products_status_check;

COMMIT;

-- ── Block 3: product_variants table ───────────────────────────
BEGIN;

CREATE TABLE IF NOT EXISTS product_variants (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id     UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type   TEXT          NOT NULL CHECK (variant_type IN ('size', 'material')),
  label          TEXT          NOT NULL,
  value          TEXT          NOT NULL,
  price          NUMERIC(10,2) DEFAULT 0,
  price_adder    NUMERIC(10,2) DEFAULT 0,
  color          TEXT,
  stock_quantity INTEGER       DEFAULT 0,
  is_active      BOOLEAN       DEFAULT true,
  sort_order     INTEGER       DEFAULT 0,
  created_at     TIMESTAMPTZ   DEFAULT NOW()
);

COMMIT;

-- ── Block 4: Category + collection tables ─────────────────────
BEGIN;

CREATE TABLE IF NOT EXISTS product_categories (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_collections (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;

-- ── Block 5: Storage bucket + policies ────────────────────────
BEGIN;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read product images"       ON storage.objects;
DROP POLICY IF EXISTS "Service role manage product images" ON storage.objects;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Service role manage product images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'product-images');

COMMIT;

-- Done!
