create extension if not exists pgcrypto;

create table if not exists public.runner_levels (
  id uuid primary key default gen_random_uuid(),
  level_number integer not null unique,
  title text not null,
  distance_target_km numeric not null,
  pace_target_seconds_per_km integer not null,
  sort_order integer not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.runner_run_logs (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.runner_levels(id) on delete restrict,
  run_date date not null,
  distance_km numeric not null,
  duration_seconds integer not null,
  pace_seconds_per_km integer not null,
  no_stop boolean not null default false,
  note text,
  effort text check (effort in ('easy', 'normal', 'hard') or effort is null),
  result text not null check (
    result in ('passed', 'failed_distance', 'failed_pace', 'failed_stopped', 'failed_multiple')
  ),
  created_at timestamptz not null default now()
);

create table if not exists public.runner_level_progress (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null unique references public.runner_levels(id) on delete cascade,
  status text not null check (status in ('locked', 'available', 'passed')),
  best_distance_km numeric,
  best_pace_seconds_per_km integer,
  best_no_stop_distance_km numeric,
  passed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists idx_runner_run_logs_level_id on public.runner_run_logs(level_id);
create index if not exists idx_runner_run_logs_run_date_desc on public.runner_run_logs(run_date desc, created_at desc);
create index if not exists idx_runner_level_progress_status on public.runner_level_progress(status);

insert into public.runner_levels (level_number, title, distance_target_km, pace_target_seconds_per_km, sort_order)
values
  (1, '1 km', 1, 600, 1),
  (2, '2 km', 2, 570, 2),
  (3, '3 km', 3, 540, 3),
  (4, '4 km', 4, 510, 4),
  (5, '5 km', 5, 480, 5)
on conflict (level_number) do update
set
  title = excluded.title,
  distance_target_km = excluded.distance_target_km,
  pace_target_seconds_per_km = excluded.pace_target_seconds_per_km,
  sort_order = excluded.sort_order;

insert into public.runner_level_progress (level_id, status)
select
  level.id,
  case
    when level.level_number = 1 then 'available'
    else 'locked'
  end as status
from public.runner_levels as level
on conflict (level_id) do nothing;

drop trigger if exists set_runner_level_progress_updated_at on public.runner_level_progress;
create trigger set_runner_level_progress_updated_at
before update on public.runner_level_progress
for each row
execute function public.set_updated_at_timestamp();
