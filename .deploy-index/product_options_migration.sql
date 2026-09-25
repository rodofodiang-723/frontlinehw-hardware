-- Optional product choices managed from the admin dashboard.
alter table if exists public.products
  add column if not exists colors text not null default '',
  add column if not exists sizes text not null default '',
  add column if not exists size_prices text not null default '';