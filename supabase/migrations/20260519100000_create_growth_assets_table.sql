create table if not exists public.growth_assets (
  id uuid primary key default gen_random_uuid(),
  asset_name text not null,
  asset_type text not null check (asset_type in ('etf', 'stock', 'mutual_fund', 'crypto', 'gold')),
  platform text,
  current_value numeric(14,2) not null default 0 check (current_value >= 0),
  invested_amount numeric(14,2) not null default 0 check (invested_amount >= 0),
  profit_loss numeric(14,2) generated always as (current_value - invested_amount) stored,
  return_percent numeric(8,2) generated always as (
    case
      when invested_amount = 0 then 0
      else ((current_value - invested_amount) / invested_amount) * 100
    end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists growth_assets_asset_type_idx on public.growth_assets (asset_type);
create index if not exists growth_assets_created_at_idx on public.growth_assets (created_at desc);

create or replace function public.set_growth_assets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists growth_assets_set_updated_at on public.growth_assets;
create trigger growth_assets_set_updated_at
before update on public.growth_assets
for each row
execute function public.set_growth_assets_updated_at();
