-- ============================================================
-- FRAMIO — Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends auth.users for customer data)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name        TEXT,
  phone       TEXT,
  email       TEXT,
  address     JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  description    TEXT,
  base_price     DECIMAL(10,2) NOT NULL,
  category       TEXT NOT NULL DEFAULT 'frames',
  subcategory    TEXT,
  tags           TEXT[] DEFAULT '{}',
  sizes          JSONB DEFAULT '[]',
  materials      JSONB DEFAULT '[]',
  layout_options JSONB DEFAULT '[]',
  images         TEXT[] DEFAULT '{}',
  mockup_image   TEXT,
  min_photos     INTEGER DEFAULT 1,
  max_photos     INTEGER DEFAULT 1,
  in_stock       BOOLEAN DEFAULT true,
  featured       BOOLEAN DEFAULT false,
  rating         DECIMAL(3,2) DEFAULT 4.5,
  review_count   INTEGER DEFAULT 0,
  occasion       TEXT[] DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              UUID REFERENCES auth.users(id),
  guest_email          TEXT,
  status               TEXT DEFAULT 'processing'
                         CHECK (status IN ('processing','printing','packed','shipped','delivered','cancelled')),
  total                DECIMAL(10,2) NOT NULL,
  subtotal             DECIMAL(10,2),
  shipping_fee         DECIMAL(10,2) DEFAULT 0,
  discount_amount      DECIMAL(10,2) DEFAULT 0,
  shipping_address     JSONB NOT NULL DEFAULT '{}',
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  razorpay_signature   TEXT,
  payment_status       TEXT DEFAULT 'pending'
                         CHECK (payment_status IN ('pending','paid','failed','refunded')),
  coupon_code          TEXT,
  notes                TEXT,
  estimated_delivery   DATE,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id         UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id       UUID REFERENCES public.products(id),
  product_name     TEXT,
  quantity         INTEGER NOT NULL DEFAULT 1,
  unit_price       DECIMAL(10,2) NOT NULL,
  size             TEXT,
  material         TEXT,
  layout           TEXT,
  custom_photo_url TEXT,
  custom_text      JSONB DEFAULT '{}',
  preview_url      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id        UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES auth.users(id),
  user_name         TEXT,
  rating            INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment           TEXT,
  photos            TEXT[] DEFAULT '{}',
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count     INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update product rating average
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.products SET
    rating       = (SELECT AVG(rating) FROM public.reviews WHERE product_id = NEW.product_id),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = NEW.product_id),
    updated_at   = NOW()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_review_inserted ON public.reviews;
CREATE TRIGGER on_review_inserted
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- ============================================================
-- WISHLISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishlists (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- SAVED DESIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_designs (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id       UUID REFERENCES public.products(id),
  name             TEXT DEFAULT 'My Design',
  size             TEXT,
  material         TEXT,
  layout           TEXT,
  custom_photo_url TEXT,
  custom_text      JSONB DEFAULT '{}',
  preview_url      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DISCOUNT CODES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code             TEXT UNIQUE NOT NULL,
  type             TEXT CHECK (type IN ('percentage','fixed')),
  value            DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses         INTEGER,
  used_count       INTEGER DEFAULT 0,
  valid_from       TIMESTAMPTZ DEFAULT NOW(),
  valid_until      TIMESTAMPTZ,
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADMIN USERS (separate from Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name         TEXT NOT NULL,
  role         TEXT DEFAULT 'admin',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_designs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own"  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own"  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Products (public read)
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (true);

-- Orders
CREATE POLICY "orders_select_own"    ON public.orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "orders_insert_any"    ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_own"    ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- Order items
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND (o.user_id = auth.uid() OR o.user_id IS NULL))
);
CREATE POLICY "order_items_insert_any" ON public.order_items FOR INSERT WITH CHECK (true);

-- Reviews (public read, auth write)
CREATE POLICY "reviews_public_read"   ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_auth_insert"   ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_auth_update"   ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- Wishlists (own only)
CREATE POLICY "wishlists_own"         ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- Saved designs (own only)
CREATE POLICY "saved_designs_own"     ON public.saved_designs FOR ALL USING (auth.uid() = user_id);

-- Discount codes (public read for validation)
CREATE POLICY "discount_codes_read"   ON public.discount_codes FOR SELECT USING (true);

-- Admin users (no public access — verified via API route only)
CREATE POLICY "admin_no_public"       ON public.admin_users FOR ALL USING (false);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customer-uploads',
  'customer-uploads',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_public_read"  ON storage.objects FOR SELECT  USING (bucket_id = 'customer-uploads');
CREATE POLICY "storage_auth_insert"  ON storage.objects FOR INSERT  WITH CHECK (bucket_id = 'customer-uploads');
CREATE POLICY "storage_auth_delete"  ON storage.objects FOR DELETE  USING (bucket_id = 'customer-uploads');

-- ============================================================
-- DEFAULT ADMIN USER  (password: admin@123)
-- ============================================================
INSERT INTO public.admin_users (email, password_hash, name, role)
VALUES (
  'admin@framio.shop',
  crypt('admin@123', gen_salt('bf', 10)),
  'Framio Admin',
  'superadmin'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- SAMPLE DISCOUNT CODE
-- ============================================================
INSERT INTO public.discount_codes (code, type, value, min_order_amount, max_uses, is_active)
VALUES ('FRAMIO10', 'percentage', 10, 499, 1000, true)
ON CONFLICT (code) DO NOTHING;
