alter table if exists public.discovery_candidates
  add column if not exists concept text,
  add column if not exists validation_notes text,
  add column if not exists validated_at timestamptz,
  add column if not exists converted_at timestamptz,
  add column if not exists converted_innovation_id uuid references public.innovations(id) on delete set null;

alter table if exists public.innovations
  add column if not exists is_blocked boolean not null default false,
  add column if not exists blocked_reason text,
  add column if not exists blocked_at timestamptz;

update public.discovery_candidates
set converted_at = coalesce(converted_at, now())
where status = 'converted' and converted_at is null;
