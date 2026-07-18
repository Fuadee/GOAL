create table if not exists public.smv_project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.smv_projects(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists smv_project_milestones_project_id_created_at_idx
  on public.smv_project_milestones (project_id, created_at asc);

create or replace function public.set_smv_project_milestones_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_smv_project_milestones_updated_at on public.smv_project_milestones;
create trigger set_smv_project_milestones_updated_at
before update on public.smv_project_milestones
for each row execute function public.set_smv_project_milestones_updated_at();

alter table public.smv_project_milestones enable row level security;

drop policy if exists smv_project_milestones_service_role_all on public.smv_project_milestones;
create policy smv_project_milestones_service_role_all
  on public.smv_project_milestones
  as permissive
  for all
  to service_role
  using (true)
  with check (true);
