create extension if not exists pgcrypto;

create table if not exists public.innovation_apps (
  id uuid primary key default gen_random_uuid(),
  innovation_id uuid not null references public.innovations(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  status text not null default 'building' check (status in ('building', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_innovation_apps_innovation_id_updated_at
  on public.innovation_apps (innovation_id, updated_at desc);

drop trigger if exists set_innovation_apps_updated_at on public.innovation_apps;
create trigger set_innovation_apps_updated_at
before update on public.innovation_apps
for each row execute function public.set_updated_at_timestamp();

alter table public.innovation_apps enable row level security;

drop policy if exists innovation_apps_service_role_all on public.innovation_apps;
create policy innovation_apps_service_role_all
  on public.innovation_apps
  for all
  to service_role
  using (true)
  with check (true);
