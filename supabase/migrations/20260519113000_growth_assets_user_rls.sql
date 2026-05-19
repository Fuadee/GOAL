alter table public.growth_assets
  add column if not exists user_id uuid references auth.users(id);

alter table public.growth_assets
  alter column user_id set default auth.uid();

update public.growth_assets
set user_id = auth.uid()
where user_id is null;

alter table public.growth_assets enable row level security;

drop policy if exists growth_assets_select_own on public.growth_assets;
create policy growth_assets_select_own
  on public.growth_assets
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists growth_assets_insert_own on public.growth_assets;
create policy growth_assets_insert_own
  on public.growth_assets
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists growth_assets_update_own on public.growth_assets;
create policy growth_assets_update_own
  on public.growth_assets
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists growth_assets_delete_own on public.growth_assets;
create policy growth_assets_delete_own
  on public.growth_assets
  for delete
  to authenticated
  using (auth.uid() = user_id);
