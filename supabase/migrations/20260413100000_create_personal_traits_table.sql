create table if not exists public.personal_traits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists personal_traits_sort_order_idx on public.personal_traits (sort_order asc, created_at asc);

drop trigger if exists set_personal_traits_updated_at on public.personal_traits;
create trigger set_personal_traits_updated_at
before update on public.personal_traits
for each row execute function public.set_updated_at_timestamp();

alter table public.personal_traits enable row level security;

create policy "personal_traits_service_role_all"
  on public.personal_traits
  as permissive
  for all
  to service_role
  using (true)
  with check (true);
