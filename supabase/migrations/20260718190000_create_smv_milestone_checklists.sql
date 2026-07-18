create table if not exists public.smv_milestone_checklists (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.smv_project_milestones(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists smv_milestone_checklists_milestone_id_created_at_idx
  on public.smv_milestone_checklists (milestone_id, created_at asc);

create or replace function public.set_smv_milestone_checklists_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_smv_milestone_checklists_updated_at on public.smv_milestone_checklists;
create trigger set_smv_milestone_checklists_updated_at
before update on public.smv_milestone_checklists
for each row execute function public.set_smv_milestone_checklists_updated_at();

create or replace function public.sync_smv_milestone_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_milestone_id uuid;
begin
  if tg_op = 'DELETE' then
    target_milestone_id := old.milestone_id;
  else
    target_milestone_id := new.milestone_id;
  end if;

  update public.smv_project_milestones
  set is_completed = (
    exists (
      select 1 from public.smv_milestone_checklists
      where milestone_id = target_milestone_id
    )
    and not exists (
      select 1 from public.smv_milestone_checklists
      where milestone_id = target_milestone_id and is_completed = false
    )
  )
  where id = target_milestone_id;

  return null;
end;
$$;

drop trigger if exists sync_smv_milestone_completion on public.smv_milestone_checklists;
create trigger sync_smv_milestone_completion
after insert or update or delete on public.smv_milestone_checklists
for each row execute function public.sync_smv_milestone_completion();

alter table public.smv_milestone_checklists enable row level security;

drop policy if exists smv_milestone_checklists_service_role_all on public.smv_milestone_checklists;
create policy smv_milestone_checklists_service_role_all
  on public.smv_milestone_checklists
  as permissive
  for all
  to service_role
  using (true)
  with check (true);
