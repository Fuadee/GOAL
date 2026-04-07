create table if not exists public.house_phase_status (
  house_id integer not null,
  phase_name text not null check (phase_name in ('planning', 'permit', 'financial', 'loan', 'construction', 'ready')),
  status text not null check (status in ('locked', 'in_progress', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (house_id, phase_name)
);

create index if not exists idx_house_phase_status_phase_name on public.house_phase_status(phase_name);
create index if not exists idx_house_phase_status_status on public.house_phase_status(status);

drop trigger if exists set_house_phase_status_updated_at on public.house_phase_status;
create trigger set_house_phase_status_updated_at
before update on public.house_phase_status
for each row
execute function public.set_updated_at_timestamp();
