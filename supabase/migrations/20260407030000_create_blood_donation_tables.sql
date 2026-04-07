create extension if not exists pgcrypto;

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.blood_donation_goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_count integer not null default 3 check (target_count > 0),
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blood_donation_goals_period_check check (start_date <= end_date)
);

create table if not exists public.blood_donation_events (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.blood_donation_goals(id) on delete cascade,
  planned_date date,
  actual_date date,
  status text not null default 'planned' check (status in ('planned', 'completed', 'missed', 'cancelled')),
  location text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blood_donation_events_completed_requires_actual_date check (
    (status <> 'completed') or (actual_date is not null)
  ),
  constraint blood_donation_events_planned_requires_planned_date check (
    (status <> 'planned') or (planned_date is not null)
  )
);

create index if not exists idx_blood_donation_events_goal_id on public.blood_donation_events(goal_id);
create index if not exists idx_blood_donation_events_status on public.blood_donation_events(status);
create index if not exists idx_blood_donation_events_planned_date on public.blood_donation_events(planned_date);
create index if not exists idx_blood_donation_events_actual_date on public.blood_donation_events(actual_date);

create trigger set_blood_donation_goals_updated_at
before update on public.blood_donation_goals
for each row
execute function public.set_updated_at_timestamp();

create trigger set_blood_donation_events_updated_at
before update on public.blood_donation_events
for each row
execute function public.set_updated_at_timestamp();
