create table if not exists public.money_goal_plans (
  id uuid primary key default gen_random_uuid(),
  plan_name text not null,
  net_increase numeric not null default 0,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_money_goal_plans_updated_at on public.money_goal_plans;

create trigger set_money_goal_plans_updated_at
before update on public.money_goal_plans
for each row
execute function public.set_updated_at_timestamp();
