alter table if exists public.innovations
  add column if not exists result text,
  add column if not exists ended_at timestamptz,
  add column if not exists is_active boolean not null default true;

alter table if exists public.innovations
  drop constraint if exists innovations_status_check;

alter table if exists public.innovations
  add constraint innovations_status_check
  check (status in ('idea', 'building', 'testing', 'blocked', 'completed', 'terminated'));

alter table if exists public.innovations
  drop constraint if exists innovations_result_check;

alter table if exists public.innovations
  add constraint innovations_result_check
  check (result is null or result in ('succeeded', 'failed'));

create or replace function public.preserve_innovation_archive_updated_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'terminated' and old.status is distinct from 'terminated' then
    new.updated_at = old.updated_at;
  end if;

  return new;
end;
$$;

drop trigger if exists zzz_preserve_innovation_archive_updated_at on public.innovations;
create trigger zzz_preserve_innovation_archive_updated_at
before update on public.innovations
for each row
execute function public.preserve_innovation_archive_updated_at();
