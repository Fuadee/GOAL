create extension if not exists pgcrypto;

create table if not exists public.innovations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  goal text,
  status text not null default 'idea' check (status in ('idea', 'building', 'testing', 'blocked', 'completed')),
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.innovation_logs (
  id uuid primary key default gen_random_uuid(),
  innovation_id uuid not null references public.innovations(id) on delete cascade,
  log_type text not null default 'update' check (log_type in ('update', 'problem', 'solution', 'decision', 'lesson')),
  title text not null,
  detail text,
  problem text,
  solution text,
  result text,
  lesson_learned text,
  next_step text,
  created_at timestamptz not null default now()
);

create index if not exists idx_innovation_logs_innovation_id on public.innovation_logs(innovation_id);
create index if not exists idx_innovation_logs_created_at_desc on public.innovation_logs(created_at desc);
create index if not exists idx_innovations_updated_at_desc on public.innovations(updated_at desc);

create trigger set_innovations_updated_at
before update on public.innovations
for each row
execute function public.set_updated_at_timestamp();

create or replace function public.touch_innovation_updated_at_from_log()
returns trigger
language plpgsql
as $$
begin
  update public.innovations
  set updated_at = now()
  where id = new.innovation_id;

  return new;
end;
$$;

create trigger touch_innovation_updated_at_after_log_insert
after insert on public.innovation_logs
for each row
execute function public.touch_innovation_updated_at_from_log();
