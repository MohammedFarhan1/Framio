-- Framio Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  phone text unique,
  email text,
  address jsonb,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- Products table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  base_price integer not null,
  type text not null,
  sizes jsonb not null default '[]',
  materials jsonb not null default '[]',
  images jsonb not null default '[]',
  badge text,
  rating numeric(2,1) default 4.5,
  review_count integer default 0,
  occasion jsonb default '[]',
  photo_slots integer default 1,
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.products enable row level security;

create policy "Products are publicly readable"
  on public.products for select
  using (active = true);

-- Orders table
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete set null,
  status text not null default 'processing',
  total integer not null,
  shipping_address jsonb not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  estimated_delivery text,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Service role can insert orders"
  on public.orders for insert
  with check (true);

create policy "Service role can update orders"
  on public.orders for update
  using (true);

-- Order items table
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  custom_photo_url text,
  custom_text text,
  selected_size text,
  selected_material text,
  quantity integer not null default 1,
  price integer not null,
  preview_data_url text,
  created_at timestamptz default now()
);

alter table public.order_items enable row level security;

create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "Service role can insert order items"
  on public.order_items for insert
  with check (true);

-- Reviews table
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete set null,
  user_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  photo_url text,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

create policy "Reviews are publicly readable"
  on public.reviews for select
  using (true);

create policy "Authenticated users can insert reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

-- Storage bucket for customer uploads
insert into storage.buckets (id, name, public)
values ('customer-uploads', 'customer-uploads', false)
on conflict (id) do nothing;

create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (bucket_id = 'customer-uploads' and auth.uid() is not null);

create policy "Users can view own uploads"
  on storage.objects for select
  using (bucket_id = 'customer-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, phone, email, name)
  values (
    new.id,
    new.phone,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed sample products
insert into public.products (name, description, base_price, type, sizes, materials, images, badge, rating, review_count, occasion, photo_slots, featured)
values
(
  'Classic Single Photo Frame',
  'A timeless frame that turns your favorite memory into wall art. Perfect for birthdays, anniversaries, and housewarming gifts.',
  599,
  'single',
  '[{"label":"6\" × 8\"","value":"6x8","price":599},{"label":"8\" × 10\"","value":"8x10","price":799},{"label":"12\" × 16\"","value":"12x16","price":1199}]',
  '[{"label":"Walnut Wood","value":"wood-walnut","priceAdder":0,"color":"#5C3D2E"},{"label":"Oak Wood","value":"wood-oak","priceAdder":0,"color":"#A67C52"},{"label":"White Wood","value":"wood-white","priceAdder":0,"color":"#F5F0EB"},{"label":"Matte Black","value":"metal-black","priceAdder":100,"color":"#1A1A1A"},{"label":"Gold Metal","value":"metal-gold","priceAdder":150,"color":"#C9A84C"},{"label":"Silver Metal","value":"metal-silver","priceAdder":100,"color":"#9E9E9E"}]',
  '["/frames/single-walnut.jpg","/frames/single-gold.jpg"]',
  'Best Seller',
  4.8,
  247,
  '["birthday","anniversary","housewarming","general"]',
  1,
  true
),
(
  '3-Photo Collage Frame',
  'Tell a story with three of your best moments in one beautiful frame. Great for couples and family gifts.',
  899,
  'collage-3',
  '[{"label":"8\" × 10\"","value":"8x10","price":899},{"label":"12\" × 16\"","value":"12x16","price":1299}]',
  '[{"label":"Walnut Wood","value":"wood-walnut","priceAdder":0,"color":"#5C3D2E"},{"label":"Oak Wood","value":"wood-oak","priceAdder":0,"color":"#A67C52"},{"label":"White Wood","value":"wood-white","priceAdder":0,"color":"#F5F0EB"},{"label":"Matte Black","value":"metal-black","priceAdder":100,"color":"#1A1A1A"},{"label":"Gold Metal","value":"metal-gold","priceAdder":150,"color":"#C9A84C"}]',
  '["/frames/collage3-walnut.jpg"]',
  'Popular',
  4.7,
  183,
  '["anniversary","couples","family","birthday"]',
  3,
  true
),
(
  'Couple Name Frame',
  'A romantic frame with your photo and personalized names engraved. The perfect wedding or anniversary gift.',
  1199,
  'couple',
  '[{"label":"8\" × 10\"","value":"8x10","price":1199},{"label":"12\" × 16\"","value":"12x16","price":1599}]',
  '[{"label":"Walnut Wood","value":"wood-walnut","priceAdder":0,"color":"#5C3D2E"},{"label":"Gold Metal","value":"metal-gold","priceAdder":150,"color":"#C9A84C"},{"label":"Silver Metal","value":"metal-silver","priceAdder":100,"color":"#9E9E9E"}]',
  '["/frames/couple-gold.jpg"]',
  'Trending',
  4.9,
  312,
  '["anniversary","wedding","couples","valentines"]',
  1,
  true
),
(
  'LED Glow Photo Frame',
  'A magical glowing frame with warm LED backlighting. Makes any photo look stunning in the dark.',
  1499,
  'led',
  '[{"label":"8\" × 10\"","value":"8x10","price":1499},{"label":"12\" × 16\"","value":"12x16","price":1999}]',
  '[{"label":"Matte Black","value":"metal-black","priceAdder":0,"color":"#1A1A1A"},{"label":"Silver Metal","value":"metal-silver","priceAdder":0,"color":"#9E9E9E"}]',
  '["/frames/led-black.jpg"]',
  'New',
  4.6,
  89,
  '["birthday","anniversary","housewarming","general"]',
  1,
  false
),
(
  '5-Photo Collage Frame',
  'Create a stunning wall display with 5 of your most cherished photos in a single beautiful frame.',
  1299,
  'collage-5',
  '[{"label":"12\" × 16\"","value":"12x16","price":1299}]',
  '[{"label":"Walnut Wood","value":"wood-walnut","priceAdder":0,"color":"#5C3D2E"},{"label":"White Wood","value":"wood-white","priceAdder":0,"color":"#F5F0EB"},{"label":"Gold Metal","value":"metal-gold","priceAdder":150,"color":"#C9A84C"}]',
  '["/frames/collage5.jpg"]',
  null,
  4.5,
  76,
  '["family","housewarming","general"]',
  5,
  false
),
(
  'Desk Photo Frame',
  'A sleek desk frame for your workspace. Show off your favorite memory while you work.',
  449,
  'desk',
  '[{"label":"6\" × 8\"","value":"6x8","price":449},{"label":"8\" × 10\"","value":"8x10","price":599}]',
  '[{"label":"Walnut Wood","value":"wood-walnut","priceAdder":0,"color":"#5C3D2E"},{"label":"Oak Wood","value":"wood-oak","priceAdder":0,"color":"#A67C52"},{"label":"Matte Black","value":"metal-black","priceAdder":50,"color":"#1A1A1A"},{"label":"Gold Metal","value":"metal-gold","priceAdder":100,"color":"#C9A84C"}]',
  '["/frames/desk-oak.jpg"]',
  null,
  4.4,
  134,
  '["birthday","general","corporate"]',
  1,
  false
);
