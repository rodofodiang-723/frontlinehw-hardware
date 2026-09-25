-- Frontline Hardware RLS hardening policies
-- Run this in Supabase SQL Editor.

begin;

-- Ensure RLS is enabled.
alter table if exists public.products enable row level security;
alter table if exists public.offers enable row level security;
alter table if exists public.leads enable row level security;

-- Cleanup old policies so this script can be rerun safely.
drop policy if exists products_public_read on public.products;
drop policy if exists products_staff_insert on public.products;
drop policy if exists products_staff_update on public.products;
drop policy if exists products_admin_delete on public.products;

drop policy if exists offers_public_read on public.offers;
drop policy if exists offers_staff_insert on public.offers;
drop policy if exists offers_staff_update on public.offers;
drop policy if exists offers_admin_delete on public.offers;

drop policy if exists leads_public_insert on public.leads;
drop policy if exists leads_admin_read on public.leads;
drop policy if exists leads_admin_delete on public.leads;

-- PRODUCTS: everyone can read; authenticated staff roles can write.
create policy products_public_read
on public.products
for select
to anon, authenticated
using (true);

create policy products_staff_insert
on public.products
for insert
to authenticated
with check (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager', 'staff')
);

create policy products_staff_update
on public.products
for update
to authenticated
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager', 'staff')
)
with check (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager', 'staff')
);

create policy products_admin_delete
on public.products
for delete
to authenticated
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager')
);

-- OFFERS: everyone can read; authenticated staff roles can write.
create policy offers_public_read
on public.offers
for select
to anon, authenticated
using (true);

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

-- LEADS: public forms can insert, but only admin/manager can read & delete.
create policy leads_public_insert
on public.leads
for insert
to anon, authenticated
with check (
  source in ('contact_form', 'newsletter') and
  char_length(coalesce(name, '')) <= 120 and
  char_length(coalesce(phone, '')) <= 30 and
  char_length(coalesce(email, '')) <= 254 and
  char_length(coalesce(source, '')) <= 60 and
  char_length(coalesce(message, '')) <= 2000 and
  (
    (
      source = 'contact_form' and
      char_length(btrim(coalesce(name, ''))) between 2 and 120 and
      btrim(coalesce(phone, '')) ~ '^[0-9+() -]{9,30}$' and
      char_length(btrim(coalesce(message, ''))) between 1 and 2000 and
      (btrim(coalesce(email, '')) = '' or btrim(email) ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$')
    ) or (
      source = 'newsletter' and
      btrim(coalesce(email, '')) ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'
    )
  )
);

create policy leads_admin_read
on public.leads
for select
to authenticated
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager')
);

create policy leads_admin_delete
on public.leads
for delete
to authenticated
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager')
);

commit;
