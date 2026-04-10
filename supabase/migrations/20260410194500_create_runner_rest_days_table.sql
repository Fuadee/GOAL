create table if not exists public.runner_rest_days (
  id uuid primary key default gen_random_uuid(),
  rest_date date not null unique,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_runner_rest_days_rest_date_desc on public.runner_rest_days(rest_date desc);
