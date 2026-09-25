-- Add top-selling product selection support.
-- Run this once in the Supabase SQL Editor.

alter table if exists public.products
  add column if not exists is_top_product boolean not null default false;

create index if not exists products_top_product_idx
  on public.products (is_top_product, category, created_at desc);

create table if not exists public.top_selling_products (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists top_selling_products_active_sort_idx
  on public.top_selling_products (is_active, sort_order, created_at desc);

alter table public.top_selling_products enable row level security;

drop policy if exists top_selling_products_public_read on public.top_selling_products;
drop policy if exists top_selling_products_staff_insert on public.top_selling_products;
drop policy if exists top_selling_products_staff_update on public.top_selling_products;
drop policy if exists top_selling_products_staff_delete on public.top_selling_products;

create policy top_selling_products_public_read
on public.top_selling_products
for select
to anon, authenticated
using (is_active = true);

create policy top_selling_products_staff_insert
on public.top_selling_products
for insert
to authenticated
with check (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager', 'staff')
);

create policy top_selling_products_staff_update
on public.top_selling_products
for update
to authenticated
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager', 'staff')
)
with check (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager', 'staff')
);

create policy top_selling_products_staff_delete
on public.top_selling_products
for delete
to authenticated
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager', 'staff')
);