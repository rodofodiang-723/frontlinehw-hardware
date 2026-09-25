-- Run once in the Supabase SQL editor to enable admin-managed storefront settings.
begin;

create table if not exists public.site_settings (
  id text primary key,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists site_settings_public_read on public.site_settings;
drop policy if exists site_settings_staff_insert on public.site_settings;
drop policy if exists site_settings_staff_update on public.site_settings;

create policy site_settings_public_read
on public.site_settings
for select
to anon, authenticated
using (true);

create policy site_settings_staff_insert
on public.site_settings
for insert
to authenticated
with check (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager', 'staff')
);

create policy site_settings_staff_update
on public.site_settings
for update
to authenticated
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager', 'staff')
)
with check (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'manager', 'staff')
);

commit;
