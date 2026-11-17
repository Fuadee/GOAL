-- Road to 5K. REVIEW/APPLY TO A DISPOSABLE DATABASE FIRST; never run from the app.
-- Transactional and rerunnable. No history/progress/reward row is removed or reset.
begin;

alter table public.runner_run_logs
  add column if not exists activity_type text not null default 'unknown',
  add column if not exists deleted_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- Keep no_stop exactly as it was. The application maps legacy true -> continuous,
-- false/null -> unknown; no backfill invents run/walk evidence.
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'runner_activity_type_check' and conrelid = 'public.runner_run_logs'::regclass) then
    alter table public.runner_run_logs add constraint runner_activity_type_check
      check (activity_type in ('continuous', 'run_walk', 'walk', 'unknown'));
  end if;
end $$;

create table if not exists public.runner_run_log_revisions (
  id uuid primary key default gen_random_uuid(),
  run_log_id uuid not null references public.runner_run_logs(id) on delete restrict,
  snapshot jsonb not null,
  reason text not null,
  recorded_at timestamptz not null default now()
);
alter table public.runner_run_log_revisions enable row level security;
revoke all on public.runner_run_log_revisions from anon, authenticated;
-- The audit trigger runs with the caller's privileges. Do not rely on a
-- project's default privileges for newly created tables.
grant select, insert on public.runner_run_log_revisions to service_role;

-- Preserve a one-time snapshot, including all original fields, before any future edits.
insert into public.runner_run_log_revisions (run_log_id, snapshot, reason)
select logs.id, to_jsonb(logs), 'migration_snapshot'
from public.runner_run_logs logs
where not exists (select 1 from public.runner_run_log_revisions r where r.run_log_id = logs.id and r.reason = 'migration_snapshot');

create or replace function public.audit_runner_run_log_update()
returns trigger language plpgsql set search_path = public as $$
begin
  insert into public.runner_run_log_revisions (run_log_id, snapshot, reason)
  values (old.id, to_jsonb(old), case when new.deleted_at is distinct from old.deleted_at then 'visibility_change' else 'edit' end);
  new.updated_at = clock_timestamp();
  return new;
end;
$$;
create or replace trigger audit_runner_run_log_update
before update on public.runner_run_logs
for each row execute function public.audit_runner_run_log_update();

alter table public.runner_levels alter column pace_target_seconds_per_km drop not null;
insert into public.runner_levels (level_number, title, distance_target_km, pace_target_seconds_per_km, sort_order)
values
 (1,'First kilometre',1,null,1), (2,'Find your rhythm',2,null,2),
 (3,'Halfway there',2.5,null,3), (4,'Build your base',3,null,4),
 (5,'Go the distance',4,null,5), (6,'Reach 5K',5,null,6),
 (7,'Run it all',5,null,7), (8,'Find your pace',5,600,8),
 (9,'Pick up speed',5,540,9), (10,'5K achieved',5,480,10)
on conflict (level_number) do update set title=excluded.title,
 distance_target_km=excluded.distance_target_km,
 pace_target_seconds_per_km=excluded.pace_target_seconds_per_km;
-- Original level UUIDs, run foreign keys, legacy results and reward records are retained.
-- Achievement statuses are derived on read, not persisted into the old five-level cache.
commit;
