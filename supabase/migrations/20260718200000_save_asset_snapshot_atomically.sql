create or replace function public.save_asset_monthly_snapshot(
  p_snapshot_month date,
  p_items jsonb,
  p_overwrite boolean default false
)
returns table (
  snapshot_id uuid,
  snapshot_month date,
  total_value numeric,
  overwritten boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_snapshot_id uuid;
  v_existing boolean := false;
  v_item_count integer;
  v_distinct_count integer;
  v_asset_count integer;
  v_total numeric(14,2);
begin
  if p_snapshot_month is null or p_snapshot_month <> date_trunc('month', p_snapshot_month)::date then
    raise exception 'INVALID_SNAPSHOT_MONTH';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_SNAPSHOT_ITEMS';
  end if;

  select count(*), count(distinct item.asset_id)
  into v_item_count, v_distinct_count
  from jsonb_to_recordset(p_items) as item(asset_id uuid, value numeric);

  if v_item_count <> jsonb_array_length(p_items) or v_item_count <> v_distinct_count then
    raise exception 'DUPLICATE_OR_INVALID_ASSET_ID';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(asset_id uuid, value numeric)
    where item.asset_id is null or item.value is null or item.value < 0
  ) then
    raise exception 'INVALID_ASSET_VALUE';
  end if;

  select count(*) into v_asset_count from public.growth_assets;
  if v_item_count <> v_asset_count or exists (
    select 1
    from public.growth_assets asset
    where not exists (
      select 1
      from jsonb_to_recordset(p_items) as item(asset_id uuid, value numeric)
      where item.asset_id = asset.id
    )
  ) then
    raise exception 'ASSET_LIST_MISMATCH';
  end if;

  select snapshot.id
  into v_snapshot_id
  from public.asset_monthly_snapshots snapshot
  where snapshot.snapshot_month = p_snapshot_month
  for update;

  if v_snapshot_id is not null then
    v_existing := true;
    if not p_overwrite then
      raise exception 'SNAPSHOT_ALREADY_EXISTS';
    end if;
  else
    insert into public.asset_monthly_snapshots (snapshot_month, total_value)
    values (p_snapshot_month, 0)
    returning id into v_snapshot_id;
  end if;

  update public.growth_assets asset
  set current_value = item.value,
      updated_at = now()
  from jsonb_to_recordset(p_items) as item(asset_id uuid, value numeric)
  where asset.id = item.asset_id;

  delete from public.asset_monthly_snapshot_items
  where asset_monthly_snapshot_items.snapshot_id = v_snapshot_id;

  insert into public.asset_monthly_snapshot_items (
    snapshot_id,
    asset_id,
    asset_name,
    asset_type,
    value
  )
  select
    v_snapshot_id,
    asset.id,
    asset.asset_name,
    asset.asset_type,
    item.value
  from jsonb_to_recordset(p_items) as item(asset_id uuid, value numeric)
  join public.growth_assets asset on asset.id = item.asset_id;

  select coalesce(sum(snapshot_item.value), 0)
  into v_total
  from public.asset_monthly_snapshot_items snapshot_item
  where snapshot_item.snapshot_id = v_snapshot_id;

  update public.asset_monthly_snapshots snapshot
  set total_value = v_total,
      updated_at = now()
  where snapshot.id = v_snapshot_id;

  return query select v_snapshot_id, p_snapshot_month, v_total, v_existing;
end;
$$;

revoke all on function public.save_asset_monthly_snapshot(date, jsonb, boolean) from public;
grant execute on function public.save_asset_monthly_snapshot(date, jsonb, boolean) to service_role;
