create table if not exists public.asset_monthly_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_month date not null,
  total_value numeric(14,2) not null default 0 check (total_value >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint asset_monthly_snapshots_month_unique unique (snapshot_month)
);

create table if not exists public.asset_monthly_snapshot_items (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.asset_monthly_snapshots(id) on delete cascade,
  asset_id uuid references public.growth_assets(id) on delete set null,
  asset_name text not null,
  asset_type text not null check (asset_type in ('investment', 'safe', 'future', 'receivable')),
  value numeric(14,2) not null default 0 check (value >= 0),
  created_at timestamptz not null default now()
);

create index if not exists asset_monthly_snapshots_month_idx on public.asset_monthly_snapshots (snapshot_month desc);
create index if not exists asset_monthly_snapshot_items_snapshot_idx on public.asset_monthly_snapshot_items (snapshot_id);
create index if not exists asset_monthly_snapshot_items_asset_idx on public.asset_monthly_snapshot_items (asset_id);

create or replace function public.set_asset_monthly_snapshots_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists asset_monthly_snapshots_set_updated_at on public.asset_monthly_snapshots;
create trigger asset_monthly_snapshots_set_updated_at
before update on public.asset_monthly_snapshots
for each row
execute function public.set_asset_monthly_snapshots_updated_at();
