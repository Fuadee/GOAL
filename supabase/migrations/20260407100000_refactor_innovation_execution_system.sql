create extension if not exists pgcrypto;

alter table if exists public.innovations
  drop column if exists progress_percent,
  drop column if exists started_at,
  drop column if exists completed_at;

create table if not exists public.innovation_process_steps (
  id uuid primary key default gen_random_uuid(),
  innovation_id uuid not null references public.innovations(id) on delete cascade,
  title text not null,
  description text,
  step_order integer,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_innovation_process_steps_innovation_id on public.innovation_process_steps(innovation_id);
create index if not exists idx_innovation_logs_innovation_id on public.innovation_logs(innovation_id);
create index if not exists idx_innovation_logs_created_at_desc on public.innovation_logs(created_at desc);

create trigger set_innovation_process_steps_updated_at
before update on public.innovation_process_steps
for each row
execute function public.set_updated_at_timestamp();

drop function if exists public.touch_innovation_updated_at_from_log();

create or replace function public.touch_innovation_updated_at()
returns trigger
language plpgsql
as $$
begin
  update public.innovations
  set updated_at = now()
  where id = coalesce(new.innovation_id, old.innovation_id);

  return coalesce(new, old);
end;
$$;

drop trigger if exists touch_innovation_updated_at_after_log_insert on public.innovation_logs;
create trigger touch_innovation_updated_at_after_log_change
after insert or update or delete on public.innovation_logs
for each row
execute function public.touch_innovation_updated_at();

create trigger touch_innovation_updated_at_after_step_change
after insert or update or delete on public.innovation_process_steps
for each row
execute function public.touch_innovation_updated_at();
