alter table public.blood_donation_events
  add column if not exists reward_title text,
  add column if not exists reward_thai_title text,
  add column if not exists reward_description text,
  add column if not exists reward_emotional_copy text,
  add column if not exists reward_image_url text,
  add column if not exists reward_status text check (reward_status in ('locked', 'unlocked', 'claimed'));

