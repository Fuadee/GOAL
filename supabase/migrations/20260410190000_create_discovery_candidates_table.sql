create table if not exists discovery_candidates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  problem text,
  source text,
  impact_score int default 0,
  feasibility_score int default 0,
  status text default 'observed' check (status in ('observed', 'pain_point', 'concept', 'validated', 'converted')),
  notes text,
  created_at timestamptz default now()
);
