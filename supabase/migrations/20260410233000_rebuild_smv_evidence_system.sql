-- Rebuild SMV module to evidence-first scoring architecture.

drop table if exists public.smv_score_events cascade;
drop table if exists public.smv_checklist_logs cascade;
drop table if exists public.smv_checklist_items cascade;
drop table if exists public.smv_score_history cascade;
drop table if exists public.smv_evidence_metric_values cascade;
drop table if exists public.smv_evidence_logs cascade;
drop table if exists public.smv_improvement_tasks cascade;
drop table if exists public.smv_metrics cascade;
drop table if exists public.smv_level_definitions cascade;
drop table if exists public.smv_dimension_scores cascade;
drop table if exists public.smv_dimensions cascade;

create table public.smv_dimensions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  description text,
  color_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.smv_level_definitions (
  id uuid primary key default gen_random_uuid(),
  dimension_id uuid not null references public.smv_dimensions(id) on delete cascade,
  level_score integer not null check (level_score between 0 and 100),
  title text not null,
  requirement_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(dimension_id, level_score)
);

create table public.smv_metrics (
  id uuid primary key default gen_random_uuid(),
  dimension_id uuid not null references public.smv_dimensions(id) on delete cascade,
  key text not null,
  label text not null,
  description text,
  value_type text not null check (value_type in ('score_0_100', 'count', 'boolean', 'currency_monthly')),
  weight numeric(6,2) not null check (weight >= 0),
  is_required boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(dimension_id, key)
);

create table public.smv_evidence_logs (
  id uuid primary key default gen_random_uuid(),
  dimension_id uuid not null references public.smv_dimensions(id) on delete cascade,
  logged_at timestamptz not null default now(),
  context text,
  note text,
  source text not null default 'manual_entry',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.smv_evidence_metric_values (
  id uuid primary key default gen_random_uuid(),
  evidence_log_id uuid not null references public.smv_evidence_logs(id) on delete cascade,
  metric_id uuid not null references public.smv_metrics(id) on delete cascade,
  numeric_value numeric(12,2),
  boolean_value boolean,
  text_value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(evidence_log_id, metric_id),
  check (
    (numeric_value is not null)::int + (boolean_value is not null)::int + (text_value is not null)::int >= 1
  )
);

create table public.smv_dimension_scores (
  dimension_id uuid primary key references public.smv_dimensions(id) on delete cascade,
  score numeric(6,2) not null default 0 check (score between 0 and 100),
  evidence_count_30d integer not null default 0,
  guard_summary text,
  explanation text,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.smv_score_history (
  id uuid primary key default gen_random_uuid(),
  dimension_id uuid not null references public.smv_dimensions(id) on delete cascade,
  score numeric(6,2) not null check (score between 0 and 100),
  evidence_count_30d integer not null default 0,
  guard_summary text,
  explanation text,
  score_breakdown jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.smv_improvement_tasks (
  id uuid primary key default gen_random_uuid(),
  dimension_id uuid not null references public.smv_dimensions(id) on delete cascade,
  title text not null,
  description text,
  priority smallint not null default 2 check (priority between 1 and 5),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'archived')),
  task_source text not null default 'system',
  requirement jsonb not null default '{}'::jsonb,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index smv_level_definitions_dimension_idx on public.smv_level_definitions (dimension_id, level_score);
create index smv_metrics_dimension_idx on public.smv_metrics (dimension_id, is_active);
create index smv_evidence_logs_dimension_logged_idx on public.smv_evidence_logs (dimension_id, logged_at desc);
create index smv_evidence_metric_values_metric_idx on public.smv_evidence_metric_values (metric_id);
create index smv_score_history_dimension_calc_idx on public.smv_score_history (dimension_id, calculated_at desc);
create index smv_improvement_tasks_dimension_status_idx on public.smv_improvement_tasks (dimension_id, status, priority);

create trigger set_smv_dimensions_updated_at
before update on public.smv_dimensions
for each row execute function public.set_updated_at_timestamp();

create trigger set_smv_level_definitions_updated_at
before update on public.smv_level_definitions
for each row execute function public.set_updated_at_timestamp();

create trigger set_smv_metrics_updated_at
before update on public.smv_metrics
for each row execute function public.set_updated_at_timestamp();

create trigger set_smv_evidence_logs_updated_at
before update on public.smv_evidence_logs
for each row execute function public.set_updated_at_timestamp();

create trigger set_smv_evidence_metric_values_updated_at
before update on public.smv_evidence_metric_values
for each row execute function public.set_updated_at_timestamp();

create trigger set_smv_dimension_scores_updated_at
before update on public.smv_dimension_scores
for each row execute function public.set_updated_at_timestamp();

create trigger set_smv_improvement_tasks_updated_at
before update on public.smv_improvement_tasks
for each row execute function public.set_updated_at_timestamp();
