create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  display_name text
);

create table if not exists running_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_goal text not null default '5k',
  current_level int not null default 1,
  current_xp int not null default 0,
  preferred_runs_per_week int not null default 3,
  preferred_run_days text[],
  recovery_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists run_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_date date not null,
  duration_minutes int not null,
  distance_km numeric(6,2) not null default 0,
  activity_type text not null check (activity_type in ('walk', 'jog', 'run')),
  effort text not null check (effort in ('easy', 'moderate', 'hard')),
  energy_today text check (energy_today in ('low', 'normal', 'high')),
  mission_type text check (mission_type in ('easy', 'standard', 'push')),
  xp_earned int not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists level_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_level int not null,
  test_distance_km numeric(6,2) not null,
  duration_minutes int,
  passed boolean not null,
  notes text,
  created_at timestamptz not null default now()
);
