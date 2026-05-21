create table if not exists public.smv_real_date_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  title text not null,
  date date not null,
  reflection text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists smv_real_date_history_date_idx
  on public.smv_real_date_history (date desc, created_at desc);

create or replace function public.set_smv_real_date_history_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_smv_real_date_history_updated_at on public.smv_real_date_history;

create trigger set_smv_real_date_history_updated_at
before update on public.smv_real_date_history
for each row
execute function public.set_smv_real_date_history_updated_at();
