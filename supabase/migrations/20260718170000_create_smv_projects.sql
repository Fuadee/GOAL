create table if not exists public.smv_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists smv_projects_created_at_idx
  on public.smv_projects (created_at desc);

create or replace function public.set_smv_projects_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_smv_projects_updated_at on public.smv_projects;
create trigger set_smv_projects_updated_at
before update on public.smv_projects
for each row execute function public.set_smv_projects_updated_at();

alter table public.smv_projects enable row level security;

drop policy if exists smv_projects_service_role_all on public.smv_projects;
create policy smv_projects_service_role_all
  on public.smv_projects
  as permissive
  for all
  to service_role
  using (true)
  with check (true);
