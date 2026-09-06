-- ============================================================
-- Xtreme Doors — Database schema & Row Level Security policies
-- ============================================================
-- Run this ONCE in Supabase: Dashboard -> SQL Editor -> New query
-- -> paste this whole file -> Run.
--
-- Design principle: every table defaults to "nobody can touch this"
-- (RLS enabled, no policy = zero access). We then add back only the
-- exact permissions each role actually needs (least privilege).
-- ============================================================

-- ---------- Helper: is the current user an admin? ----------
-- SECURITY DEFINER means this function runs with elevated rights
-- internally (so it can check admin_users without triggering
-- infinite recursion through admin_users' own RLS policy), but it
-- only ever returns true/false — it can't be used to leak data.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- Admins can see who else is an admin. Nothing else can read this table.
-- (There is deliberately no INSERT/UPDATE/DELETE policy at all — admin
-- accounts are only ever added by you, running SQL directly, never
-- through the app. This means no code path anywhere can create a new
-- admin, which is exactly what we want.)
drop policy if exists "admins can view admin list" on public.admin_users;
create policy "admins can view admin list"
  on public.admin_users for select
  using (public.is_admin());

-- ---------- QUOTES ----------
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text,
  city text,
  product_type text not null,
  quantity text,
  message text,
  status text not null default 'new' check (status in ('new','responded','closed')),
  admin_notes text
);
alter table public.quotes enable row level security;

-- No INSERT policy for anon/public here on purpose: the public Get
-- Quote form never talks to Supabase directly. It goes through our
-- /api/quote serverless function, which validates + rate-limits the
-- submission first, then writes using the service role key. That
-- keeps ALL writes to this table funneled through one audited path.
drop policy if exists "admins can view quotes" on public.quotes;
create policy "admins can view quotes"
  on public.quotes for select
  using (public.is_admin());

drop policy if exists "admins can update quotes" on public.quotes;
create policy "admins can update quotes"
  on public.quotes for update
  using (public.is_admin());

drop policy if exists "admins can delete quotes" on public.quotes;
create policy "admins can delete quotes"
  on public.quotes for delete
  using (public.is_admin());

-- ---------- PRODUCTS ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  description text not null,
  features jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '[]'::jsonb,
  image_path text,
  icon_name text not null default 'Layers',
  sort_order int not null default 0,
  is_active boolean not null default true
);
alter table public.products enable row level security;

-- The public marketing site is allowed to read active products only
-- (this is intentionally public data — it's what customers browse).
drop policy if exists "public can view active products" on public.products;
create policy "public can view active products"
  on public.products for select
  using (is_active = true);

drop policy if exists "admins can view all products" on public.products;
create policy "admins can view all products"
  on public.products for select
  using (public.is_admin());

drop policy if exists "admins can insert products" on public.products;
create policy "admins can insert products"
  on public.products for insert
  with check (public.is_admin());

drop policy if exists "admins can update products" on public.products;
create policy "admins can update products"
  on public.products for update
  using (public.is_admin());

drop policy if exists "admins can delete products" on public.products;
create policy "admins can delete products"
  on public.products for delete
  using (public.is_admin());

-- ---------- RATE LIMITING (used by /api/quote) ----------
create table if not exists public.rate_limits (
  key text primary key,
  count int not null default 1,
  window_start timestamptz not null default now()
);
alter table public.rate_limits enable row level security;
-- Deliberately zero policies: only the service role key (our server
-- code) can touch this table at all. Nothing else needs to.

-- ---------- LOGIN LOCKOUT (used by /api/admin/login) ----------
create table if not exists public.login_attempts (
  identifier text primary key,
  attempts int not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.login_attempts enable row level security;
-- Same as above: zero policies, service-role-only access.

-- ---------- STORAGE: product images ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Anyone can VIEW product images (they're shown on the public site).
-- Nobody can upload/list/delete through the client — uploads only
-- happen via /api/admin/upload, which validates the file and uses
-- the service role key server-side.
drop policy if exists "public can view product images" on storage.objects;
create policy "public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- ============================================================
-- After running this, create your admin account:
-- 1. Dashboard -> Authentication -> Users -> Add user -> create
--    yourself with a strong password (email confirmed = yes).
-- 2. Copy that user's UID from the Users list.
-- 3. Run this (replacing the UID):
--
--    insert into public.admin_users (user_id) values ('paste-uid-here');
--
-- That is the ONLY way an admin account can ever be created —
-- there is no sign-up form anywhere in the app.
-- ============================================================
