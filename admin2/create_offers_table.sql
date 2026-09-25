-- Create missing offers table + RLS policies for Frontline admin
-- Run this in Supabase SQL Editor.

begin;

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price_text text not null default '',
  image_url text not null default '',
  whatsapp_text text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offers_active_sort_created_idx
  on public.offers (is_active, sort_order, created_at desc);

create index if not exists offers_title_idx
  on public.offers (title);

alter table public.offers enable row level security;

drop policy if exists offers_public_read_active on public.offers;
drop policy if exists offers_staff_read_all on public.offers;
drop policy if exists offers_staff_insert on public.offers;
drop policy if exists offers_staff_update on public.offers;
drop policy if exists offers_admin_delete on public.offers;

-- Public storefront reads only active offers.
create policy offers_public_read_active
on public.offers
for select
to anon
using (is_active = true);

-- Staff/admin dashboards can read all offers, including inactive ones.
create policy offers_staff_read_all
on public.offers
for select
to authenticated
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager', 'staff')
);

create policy offers_staff_insert
on public.offers
for insert
to authenticated
with check (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager', 'staff')
);

create policy offers_staff_update
on public.offers
for update
to authenticated
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager', 'staff')
)
with check (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager', 'staff')
);

create policy offers_admin_delete
on public.offers
for delete
to authenticated
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager')
);

commit;
