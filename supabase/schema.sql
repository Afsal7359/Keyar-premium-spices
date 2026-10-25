-- ========================================================
-- Keyaar Premium Spices - Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://app.supabase.com)
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PRODUCTS TABLE
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  scientific_name text,
  description text not null,
  short_description text,
  category text not null default 'Whole Spices',
  origin text not null default 'Kerala, India',
  grade text not null default 'Grade A+ Bold',
  harvest_year text default '2026',
  aroma_notes text[] default array['Citrus', 'Sweet'],
  sizes_prices jsonb not null,
  images text[] not null,
  is_featured boolean default false,
  stock_status text default 'In Stock',
  rating numeric(2,1) default 5.0,
  review_count integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ORDERS TABLE
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) default 0.00,
  coupon_code text,
  shipping_fee numeric(10,2) default 0.00,
  tax numeric(10,2) default 0.00,
  total numeric(10,2) not null,
  payment_method text not null default 'razorpay',
  payment_status text not null default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  order_status text not null default 'Processing',
  tracking_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. COUPONS TABLE
create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null,
  min_order_value numeric(10,2) default 0.00,
  is_active boolean default true,
  usage_count integer default 0,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. REVIEWS TABLE
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_slug text not null references public.products(slug) on delete cascade,
  author_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  comment text not null,
  verified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.coupons enable row level security;
alter table public.reviews enable row level security;

-- Policies:
-- Allow anyone to read products, coupons, and reviews
create policy "Allow public read on products" on public.products for select using (true);
create policy "Allow public insert/update on products" on public.products for all using (true);

create policy "Allow public read on coupons" on public.coupons for select using (true);
create policy "Allow public read on reviews" on public.reviews for select using (true);
create policy "Allow public insert on reviews" on public.reviews for insert with check (true);

-- Allow public insert orders and read orders with order ID
create policy "Allow public insert on orders" on public.orders for insert with check (true);
create policy "Allow public read on orders" on public.orders for select using (true);
create policy "Allow public update on orders" on public.orders for update using (true);

-- ========================================================
-- SEED INITIAL DATA
-- ========================================================

insert into public.coupons (code, discount_type, discount_value, min_order_value)
values 
  ('KEYAAR10', 'percentage', 10, 499),
  ('PREMIUM200', 'fixed', 200, 999),
  ('FIRSTSPICE', 'percentage', 15, 0)
on conflict (code) do nothing;

insert into public.products (name, slug, scientific_name, description, short_description, category, origin, grade, harvest_year, aroma_notes, sizes_prices, images, is_featured, rating, review_count)
values
(
  'Green Cardamom',
  'green-cardamom',
  'Elettaria cardamomum',
  'Harvested exclusively at optimal ripeness from shade-grown estates in the mist-veiled hills of Idukki, Kerala. Each pod is meticulously hand-graded to ensure an 8mm+ plump caliper, vibrant deep emerald hue, and maximum essential oil concentration. When crushed, it releases an intoxicating symphony of eucalyptus, sweet citrus, and delicate floral pine.',
  'Plump, fragrant whole green pods with dense black seeds bursting with volatile aromatics.',
  'Whole Pods',
  'Idukki, High Ranges, Kerala',
  'Grade A+ Super Bold (8mm+)',
  '2026 Reserve',
  array['Citrus', 'Eucalyptus', 'Sweet Flora', 'Camphorous'],
  '[
    {"size": "50g", "price": 320, "stock": 80},
    {"size": "100g", "price": 590, "stock": 120},
    {"size": "250g", "price": 1390, "stock": 50},
    {"size": "500g", "price": 2650, "stock": 35},
    {"size": "1kg", "price": 5100, "stock": 20}
  ]'::jsonb,
  array['/images/spices/cardamom.jpg'],
  true,
  4.9,
  86
),
(
  'Tellicherry Black Pepper',
  'tellicherry-black-pepper',
  'Piper nigrum',
  'Known globally as the King of Spices, our Tellicherry Black Pepper is harvested from mature berries left on the vine until the first signs of blushing red. Slowly sun-dried on clean bamboo mats, producing deeply wrinkled, obsidian pearls with rich piperine levels. Delivers an immediate bold heat that softens into warm cedar, citrus peel, and forest earth.',
  'Dense, wrinkled berries with sharp clean heat and piney wood finish.',
  'Whole Berries',
  'Malabar Coast, Wayanad',
  'Tellicherry Garbled Extra Bold (TGSEB)',
  '2026 Reserve',
  array['Pungent', 'Woody', 'Bright Citrus', 'Cedar'],
  '[
    {"size": "50g", "price": 180, "stock": 100},
    {"size": "100g", "price": 320, "stock": 150},
    {"size": "250g", "price": 750, "stock": 60},
    {"size": "500g", "price": 1420, "stock": 40},
    {"size": "1kg", "price": 2700, "stock": 25}
  ]'::jsonb,
  array['/images/spices/pepper.jpg'],
  true,
  4.8,
  64
),
(
  'Zanzibar Whole Cloves',
  'zanzibar-whole-cloves',
  'Syzygium aromaticum',
  'Hand-picked flower buds gathered just before opening into crimson blossom. Carefully shade-cured to seal the rich eugenol essential oils within the crown and stem. Each bud boasts a full, intact rounded head and rich reddish-brown tone. Imparts an opulent, tingling warmth with notes of molasses, sweet resin, and spiced leather.',
  'Whole dried flower buds with deep, warm intensity and high oil luster.',
  'Whole Buds',
  'Kottayam & Zanzibar',
  'Hand-Sorted Headed Grade',
  '2026 Reserve',
  array['Warm', 'Sweet Resin', 'Intense', 'Molasses'],
  '[
    {"size": "50g", "price": 240, "stock": 70},
    {"size": "100g", "price": 440, "stock": 90},
    {"size": "250g", "price": 1050, "stock": 45},
    {"size": "500g", "price": 1980, "stock": 30},
    {"size": "1kg", "price": 3800, "stock": 15}
  ]'::jsonb,
  array['/images/spices/clove.jpg'],
  true,
  5.0,
  42
),
(
  'Nutmeg Flower (Mace Blades)',
  'nutmeg-flower-mace',
  'Myristica fragrans',
  'The delicate, fiery crimson aril (lattice) that wraps tightly around the fresh nutmeg kernel. Gently peeled by hand in unbroken whole blades and dried under ambient warmth until turning a rich golden amber. Far more floral, elegant, and complex than nutmeg, with subtle saffron undertones and lingering sweetness.',
  'The crimson lace wrapping the nutmeg seed, possessing floral warmth and elegance.',
  'Floral & Lace',
  'Chalakudy River Basin, Kerala',
  'Whole Golden Amber Blades',
  '2026 Reserve',
  array['Floral', 'Warm', 'Delicate', 'Honey Spice'],
  '[
    {"size": "50g", "price": 380, "stock": 50},
    {"size": "100g", "price": 690, "stock": 75},
    {"size": "250g", "price": 1650, "stock": 30},
    {"size": "500g", "price": 3150, "stock": 20},
    {"size": "1kg", "price": 6100, "stock": 10}
  ]'::jsonb,
  array['/images/spices/mace.jpg'],
  true,
  4.9,
  38
)
on conflict (slug) do nothing;
