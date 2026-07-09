-- ============================================================
-- FRAMIO — Admin & Features Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- Step 1: Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Order status constraint (adds pending, confirmed, returned)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','confirmed','processing','printing','packed','shipped','delivered','cancelled','returned'));

-- Step 3: Courier / tracking / refund columns on orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_name    TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_url    TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_reason   TEXT;

-- Step 4: Discount codes — add free_shipping type
ALTER TABLE public.discount_codes DROP CONSTRAINT IF EXISTS discount_codes_type_check;
ALTER TABLE public.discount_codes ADD CONSTRAINT discount_codes_type_check
  CHECK (type IN ('percentage','fixed','free_shipping'));

-- Step 5: Reviews — moderation fields
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_approved    BOOLEAN DEFAULT true;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_featured    BOOLEAN DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS admin_reply    TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS admin_reply_at TIMESTAMPTZ;

-- Step 6: Return requests table
CREATE TABLE IF NOT EXISTS public.return_requests (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id       UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id        UUID REFERENCES auth.users(id),
  reason         TEXT NOT NULL,
  description    TEXT,
  status         TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected','refunded','completed')),
  photos         TEXT[] DEFAULT '{}',
  refund_amount  DECIMAL(10,2) DEFAULT 0,
  admin_notes    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "return_own_select" ON public.return_requests;
DROP POLICY IF EXISTS "return_own_insert" ON public.return_requests;
CREATE POLICY "return_own_select" ON public.return_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "return_own_insert" ON public.return_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 7: Inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id          UUID REFERENCES public.products(id) ON DELETE CASCADE UNIQUE NOT NULL,
  sku                 TEXT,
  stock_quantity      INTEGER DEFAULT 100,
  low_stock_threshold INTEGER DEFAULT 10,
  is_available        BOOLEAN DEFAULT true,
  material_stock      JSONB DEFAULT '{}',
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inventory_public_read" ON public.inventory;
CREATE POLICY "inventory_public_read" ON public.inventory FOR SELECT USING (true);

-- Seed inventory for all existing products (100 units each)
INSERT INTO public.inventory (product_id, stock_quantity, low_stock_threshold, is_available)
SELECT id, 100, 10, true FROM public.products
ON CONFLICT (product_id) DO NOTHING;

-- Step 8: Remove any old seller user (not needed — admin and seller are the same person)
DELETE FROM public.admin_users WHERE email = 'seller@framio.shop';

-- Step 9: Create / reset the ONE admin user
-- Email: admin@framio.shop  |  Password: admin@123
INSERT INTO public.admin_users (email, password_hash, name, role)
VALUES (
  'admin@framio.shop',
  crypt('admin@123', gen_salt('bf', 10)),
  'Framio Admin',
  'superadmin'
)
ON CONFLICT (email) DO UPDATE
  SET password_hash = crypt('admin@123', gen_salt('bf', 10)),
      name          = 'Framio Admin',
      role          = 'superadmin';

-- Verify: you should see exactly 1 row with email admin@framio.shop
SELECT id, email, name, role, created_at FROM public.admin_users;
