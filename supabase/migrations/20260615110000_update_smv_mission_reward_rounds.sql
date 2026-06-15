alter table public.smv_mission_rewards
  add column if not exists target_count integer not null default 1,
  add column if not exists round_number integer not null default 1;

alter table public.smv_mission_rewards
  drop constraint if exists smv_mission_rewards_status_check;

alter table public.smv_mission_rewards
  add constraint smv_mission_rewards_status_check
  check (status in ('locked', 'unlocked', 'unclaimed', 'claimed'));

update public.smv_mission_rewards
set
  status = 'unclaimed',
  target_count = coalesce(target_count, 1),
  round_number = coalesce(round_number, 1)
where reward_key = 'smv_reward'
  and status = 'locked';
