-- ============================================================
-- Framio Product Management Schema
-- Run in Supabase SQL Editor → New Query
-- ============================================================

-- 1. Product categories
CREATE TABLE IF NOT EXISTS product_categories (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT        NOT NULL,
  slug         TEXT        NOT NULL UNIQUE,
  description  TEXT,
  is_active    BOOLEAN     DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Product collections
CREATE TABLE IF NOT EXISTS product_collections (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT        NOT NULL,
  slug         TEXT        NOT NULL UNIQUE,
  description  TEXT,
  is_active    BOOLEAN     DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Main products table
CREATE TABLE IF NOT EXISTS products (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT        NOT NULL,
  slug             TEXT        NOT NULL UNIQUE,
  description      TEXT,
  base_price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  status           TEXT        NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','published','archived')),
  badge            TEXT,        -- 'Best Seller','Popular','Trending','New','Sale'
  type             TEXT        DEFAULT 'single',
  photo_slots      INTEGER     DEFAULT 1,
  rating           NUMERIC(3,1) DEFAULT 0,
  review_count     INTEGER     DEFAULT 0,
  featured         BOOLEAN     DEFAULT false,
  is_active        BOOLEAN     DEFAULT true,
  images           TEXT[]      DEFAULT '{}',
  occasion         TEXT[]      DEFAULT '{}',
  category_id      UUID        REFERENCES product_categories(id) ON DELETE SET NULL,
  collection_id    UUID        REFERENCES product_collections(id) ON DELETE SET NULL,
  seo_title        TEXT,
  seo_description  TEXT,
  stock_quantity   INTEGER     DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Product variants (sizes + materials)
CREATE TABLE IF NOT EXISTS product_variants (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id     UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type   TEXT        NOT NULL CHECK (variant_type IN ('size','material')),
  label          TEXT        NOT NULL,
  value          TEXT        NOT NULL,
  price          NUMERIC(10,2) DEFAULT 0,
  price_adder    NUMERIC(10,2) DEFAULT 0,
  color          TEXT,
  stock_quantity INTEGER     DEFAULT 0,
  is_active      BOOLEAN     DEFAULT true,
  sort_order     INTEGER     DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (drop + recreate to be idempotent)
DROP POLICY IF EXISTS "Public can view published products"  ON products;
DROP POLICY IF EXISTS "Service role full access products"  ON products;
CREATE POLICY "Public can view published products" ON products
  FOR SELECT USING (status = 'published' AND is_active = true);

DROP POLICY IF EXISTS "Public can view product variants"   ON product_variants;
CREATE POLICY "Public can view product variants" ON product_variants
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view categories"         ON product_categories;
CREATE POLICY "Public can view categories" ON product_categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view collections"        ON product_collections;
CREATE POLICY "Public can view collections" ON product_collections
  FOR SELECT USING (is_active = true);

-- 7. Seed categories
INSERT INTO product_categories (name, slug, description) VALUES
  ('Wall Frames',    'wall-frames',    'Frames designed to hang on walls'),
  ('Desk Frames',    'desk-frames',    'Compact frames for desks and shelves'),
  ('LED Frames',     'led-frames',     'Frames with built-in LED lighting'),
  ('Collage Frames', 'collage-frames', 'Multi-photo collage frames')
ON CONFLICT (slug) DO NOTHING;

-- 8. Seed collections
INSERT INTO product_collections (name, slug, description) VALUES
  ('Anniversary Collection', 'anniversary', 'Perfect for couples and anniversaries'),
  ('Birthday Specials',      'birthday',    'Great birthday gift ideas'),
  ('Family Memories',        'family',      'Celebrate family moments'),
  ('Wedding Gifts',          'wedding',     'Timeless wedding gifts')
ON CONFLICT (slug) DO NOTHING;
