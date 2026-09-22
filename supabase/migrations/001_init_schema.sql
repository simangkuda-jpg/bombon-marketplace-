-- =========================================================
-- BOMBON MARKETPLACE — INITIAL SCHEMA
-- Jalankan file ini di Supabase SQL Editor (Dashboard > SQL Editor)
-- =========================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- =========================================================
-- ENUM TYPES
-- =========================================================
create type user_role as enum ('user', 'admin');
create type user_status as enum ('active', 'suspended', 'banned');
create type product_status as enum ('draft', 'active', 'reserved', 'sold', 'disabled', 'deleted');
create type product_condition as enum ('baru', 'bekas');
create type transaction_method as enum ('cod', 'pengiriman', 'keduanya');
create type order_status as enum (
  'pending', 'accepted', 'processing', 'ready', 'shipped',
  'completed', 'cancelled', 'rejected'
);
create type report_target as enum ('product', 'user', 'chat');
create type report_reason as enum ('penipuan', 'barang_ilegal', 'spam', 'harga_tidak_sesuai', 'konten_tidak_pantas', 'lainnya');

-- =========================================================
-- PROFILES (extends auth.users)
-- =========================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  username text unique not null,
  whatsapp_number text not null,
  whatsapp_visible boolean not null default true,
  email text,
  avatar_url text,
  bio text,
  role user_role not null default 'user',
  status user_status not null default 'active',
  rating_avg numeric(2,1) not null default 0,
  rating_count int not null default 0,
  transaction_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- CATEGORIES
-- =========================================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- PRODUCTS
-- =========================================================
create table products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references profiles(id) on delete cascade,
  category_id uuid references categories(id),
  name text not null,
  description text not null,
  price numeric(14,2) not null check (price >= 0),
  is_negotiable boolean not null default false,
  condition product_condition not null,
  stock int not null default 1 check (stock >= 0),
  status product_status not null default 'draft',
  transaction_method transaction_method not null default 'keduanya',
  city text not null,
  district text,
  latitude double precision,
  longitude double precision,
  whatsapp_number text,
  view_count int not null default 0,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_status on products(status);
create index idx_products_category on products(category_id);
create index idx_products_seller on products(seller_id);
create index idx_products_created on products(created_at desc);

create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- ORDERS
-- =========================================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references profiles(id),
  seller_id uuid not null references profiles(id),
  status order_status not null default 'pending',
  transaction_method transaction_method not null,
  buyer_name text not null,
  buyer_whatsapp text not null,
  buyer_address text,
  note text,
  shipping_cost numeric(14,2) not null default 0,
  subtotal numeric(14,2) not null,
  total numeric(14,2) not null,
  cancel_reason text,
  reject_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint buyer_not_seller check (buyer_id <> seller_id)
);

create index idx_orders_buyer on orders(buyer_id);
create index idx_orders_seller on orders(seller_id);
create index idx_orders_status on orders(status);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  product_name text not null,
  product_price numeric(14,2) not null,
  product_image text,
  quantity int not null check (quantity >= 1)
);

create table order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  changed_by uuid references profiles(id),
  note text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- CHAT
-- =========================================================
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references profiles(id),
  seller_id uuid not null references profiles(id),
  product_id uuid references products(id),
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (buyer_id, seller_id, product_id)
);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_messages_conversation on messages(conversation_id, created_at);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null, -- e.g. 'order_new', 'order_accepted', 'chat_new', etc
  title text not null,
  body text,
  link_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id, is_read);

-- =========================================================
-- FAVORITES
-- =========================================================
create table favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- =========================================================
-- REVIEWS
-- =========================================================
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id),
  reviewer_id uuid not null references profiles(id),
  reviewee_id uuid not null references profiles(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (order_id, reviewer_id)
);

-- =========================================================
-- REPORTS & MODERATION
-- =========================================================
create table reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references profiles(id),
  target_type report_target not null,
  target_id uuid not null,
  reason report_reason not null,
  description text,
  status text not null default 'open', -- open, reviewed, dismissed
  created_at timestamptz not null default now()
);

create table blocked_users (
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table admin_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references profiles(id),
  action text not null,
  target_type text,
  target_id uuid,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- TRIGGERS: updated_at
-- =========================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();
create trigger trg_products_updated before update on products
  for each row execute function set_updated_at();
create trigger trg_orders_updated before update on orders
  for each row execute function set_updated_at();

-- Auto-create profile on signup (name/username/whatsapp passed via user metadata)
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, username, whatsapp_number, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Pengguna Baru'),
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'whatsapp_number', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Log order status changes automatically
create or replace function log_order_status_change()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into order_status_history (order_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, new.buyer_id);
  elsif (old.status is distinct from new.status) then
    insert into order_status_history (order_id, from_status, to_status)
    values (new.id, old.status, new.status);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_order_status_log
  after insert or update on orders
  for each row execute function log_order_status_change();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table profiles enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table favorites enable row level security;
alter table reviews enable row level security;
alter table reports enable row level security;
alter table blocked_users enable row level security;
alter table admin_logs enable row level security;

-- Helper: is current user admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- PROFILES
create policy "Profil publik dapat dilihat semua" on profiles for select using (true);
create policy "User dapat update profil sendiri" on profiles for update using (auth.uid() = id);
create policy "Admin dapat update semua profil" on profiles for update using (is_admin());

-- CATEGORIES (public read, admin write)
create policy "Kategori dapat dilihat semua" on categories for select using (true);
create policy "Admin kelola kategori" on categories for all using (is_admin());

-- PRODUCTS
create policy "Produk aktif dapat dilihat semua" on products for select
  using (status in ('active','reserved','sold') or seller_id = auth.uid() or is_admin());
create policy "User dapat buat produk sendiri" on products for insert
  with check (seller_id = auth.uid());
create policy "Penjual dapat update produk sendiri" on products for update
  using (seller_id = auth.uid() or is_admin());
create policy "Penjual dapat hapus produk sendiri" on products for delete
  using (seller_id = auth.uid() or is_admin());

-- PRODUCT IMAGES
create policy "Gambar produk dapat dilihat semua" on product_images for select using (true);
create policy "Penjual kelola gambar produknya" on product_images for all
  using (exists (select 1 from products p where p.id = product_id and (p.seller_id = auth.uid() or is_admin())));

-- ORDERS
create policy "Pembeli/penjual lihat order miliknya" on orders for select
  using (buyer_id = auth.uid() or seller_id = auth.uid() or is_admin());
create policy "Pembeli buat order" on orders for insert
  with check (buyer_id = auth.uid());
create policy "Pembeli/penjual update order miliknya" on orders for update
  using (buyer_id = auth.uid() or seller_id = auth.uid() or is_admin());

-- ORDER ITEMS
create policy "Lihat item order milik sendiri" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.buyer_id = auth.uid() or o.seller_id = auth.uid() or is_admin())));
create policy "Insert item saat buat order" on order_items for insert
  with check (exists (select 1 from orders o where o.id = order_id and o.buyer_id = auth.uid()));

-- ORDER STATUS HISTORY
create policy "Lihat histori order milik sendiri" on order_status_history for select
  using (exists (select 1 from orders o where o.id = order_id and (o.buyer_id = auth.uid() or o.seller_id = auth.uid() or is_admin())));

-- CONVERSATIONS
create policy "Lihat percakapan milik sendiri" on conversations for select
  using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "Buat percakapan sebagai partisipan" on conversations for insert
  with check (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "Update percakapan milik sendiri" on conversations for update
  using (buyer_id = auth.uid() or seller_id = auth.uid());

-- MESSAGES
create policy "Lihat pesan di percakapan sendiri" on messages for select
  using (exists (select 1 from conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));
create policy "Kirim pesan sebagai partisipan" on messages for insert
  with check (
    sender_id = auth.uid() and
    exists (select 1 from conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid()))
  );
create policy "Update status baca pesan sendiri" on messages for update
  using (exists (select 1 from conversations c where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));

-- NOTIFICATIONS
create policy "Lihat notifikasi sendiri" on notifications for select using (user_id = auth.uid());
create policy "Update notifikasi sendiri" on notifications for update using (user_id = auth.uid());
create policy "Sistem buat notifikasi" on notifications for insert with check (true);

-- FAVORITES
create policy "Lihat favorit sendiri" on favorites for select using (user_id = auth.uid());
create policy "Kelola favorit sendiri" on favorites for all using (user_id = auth.uid());

-- REVIEWS
create policy "Review dapat dilihat semua" on reviews for select using (true);
create policy "Buat review untuk order sendiri" on reviews for insert
  with check (
    reviewer_id = auth.uid() and
    exists (select 1 from orders o where o.id = order_id and o.status = 'completed' and (o.buyer_id = auth.uid() or o.seller_id = auth.uid()))
  );

-- REPORTS
create policy "Lihat laporan sendiri atau admin" on reports for select
  using (reporter_id = auth.uid() or is_admin());
create policy "Buat laporan" on reports for insert with check (reporter_id = auth.uid());
create policy "Admin update laporan" on reports for update using (is_admin());

-- BLOCKED USERS
create policy "Kelola blokir sendiri" on blocked_users for all using (blocker_id = auth.uid());

-- ADMIN LOGS
create policy "Hanya admin lihat log" on admin_logs for select using (is_admin());
create policy "Hanya admin insert log" on admin_logs for insert with check (is_admin());

-- =========================================================
-- STORAGE BUCKETS (jalankan terpisah bila perlu via dashboard)
-- =========================================================
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

create policy "Avatar publik dapat dilihat" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "User upload avatar sendiri" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Foto produk publik dapat dilihat" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "User upload foto produk sendiri" on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- =========================================================
-- SEED: KATEGORI DASAR
-- =========================================================
insert into categories (name, slug, icon, sort_order) values
  ('Elektronik', 'elektronik', 'Cpu', 1),
  ('HP & Tablet', 'hp-tablet', 'Smartphone', 2),
  ('Laptop', 'laptop', 'Laptop', 3),
  ('Fashion', 'fashion', 'Shirt', 4),
  ('Kendaraan', 'kendaraan', 'Car', 5),
  ('Gaming', 'gaming', 'Gamepad2', 6),
  ('Hobi', 'hobi', 'Palette', 7),
  ('Rumah', 'rumah', 'Home', 8),
  ('Jasa', 'jasa', 'Wrench', 9),
  ('Lainnya', 'lainnya', 'MoreHorizontal', 10)
on conflict do nothing;
