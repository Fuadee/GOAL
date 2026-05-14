alter table public.innovations
  add column if not exists reward_title text,
  add column if not exists reward_thai_title text,
  add column if not exists reward_description text,
  add column if not exists reward_emotional_copy text,
  add column if not exists reward_image_url text,
  add column if not exists reward_status text not null default 'locked';

alter table public.innovations
  drop constraint if exists innovations_reward_status_check;

alter table public.innovations
  add constraint innovations_reward_status_check
  check (reward_status in ('locked', 'ready_to_claim', 'claimed'));
