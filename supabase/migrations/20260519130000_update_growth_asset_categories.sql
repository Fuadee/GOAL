alter table public.growth_assets
  drop constraint if exists growth_assets_asset_type_check;

update public.growth_assets
set asset_type = case
  when asset_type in ('etf', 'stock', 'mutual_fund', 'crypto', 'gold') then 'investment'
  when asset_type = 'other' then 'safe'
  else asset_type
end;

alter table public.growth_assets
  add constraint growth_assets_asset_type_check
  check (asset_type in ('investment', 'safe', 'future', 'receivable'));
