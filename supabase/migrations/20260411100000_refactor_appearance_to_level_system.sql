-- Refactor SMV look dimension to strict 3-axis level-based progression.

alter table public.smv_evidence_logs
  add column if not exists appearance_category text,
  add column if not exists target_level integer,
  add column if not exists evidence_type text;

alter table public.smv_evidence_logs
  drop constraint if exists smv_evidence_logs_appearance_category_check;

alter table public.smv_evidence_logs
  add constraint smv_evidence_logs_appearance_category_check
  check (appearance_category is null or appearance_category in ('style', 'body', 'grooming'));

alter table public.smv_evidence_logs
  drop constraint if exists smv_evidence_logs_target_level_check;

alter table public.smv_evidence_logs
  add constraint smv_evidence_logs_target_level_check
  check (target_level is null or target_level between 1 and 4);

create table if not exists public.smv_appearance_progress (
  id uuid primary key default gen_random_uuid(),
  dimension_id uuid not null references public.smv_dimensions(id) on delete cascade,
  category_key text not null check (category_key in ('style', 'body', 'grooming')),
  unlocked_level integer not null default 0 check (unlocked_level between 0 and 4),
  note text,
  evidence_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dimension_id, category_key)
);

create index if not exists smv_appearance_progress_dimension_idx on public.smv_appearance_progress (dimension_id, category_key);

insert into public.smv_appearance_progress (dimension_id, category_key, unlocked_level, note)
select d.id, c.category_key, 0, 'initialized by level-system migration'
from public.smv_dimensions d
cross join (values ('style'), ('body'), ('grooming')) as c(category_key)
where d.key = 'look'
on conflict (dimension_id, category_key) do nothing;

-- Stop using legacy manual/metric style scoring for look dimension.
update public.smv_metrics
set is_active = false,
    updated_at = now()
where dimension_id in (select id from public.smv_dimensions where key = 'look')
  and key in ('cleanliness', 'presence', 'overall_impact');

-- Normalize any legacy data into safe default bounds.
update public.smv_appearance_progress
set unlocked_level = greatest(0, least(unlocked_level, case when category_key = 'style' then 4 else 3 end));
