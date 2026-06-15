create table if not exists public.smv_mission_rewards (
  id uuid primary key default gen_random_uuid(),
  reward_key text not null unique,
  title text not null,
  description text,
  emotional_copy text,
  image_url text,
  status text check (status in ('locked', 'unlocked', 'claimed')),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_smv_mission_rewards_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_smv_mission_rewards_updated_at on public.smv_mission_rewards;

create trigger set_smv_mission_rewards_updated_at
before update on public.smv_mission_rewards
for each row
execute function public.set_smv_mission_rewards_updated_at();

insert into public.smv_mission_rewards (
  reward_key,
  title,
  description,
  emotional_copy,
  image_url,
  status
) values (
  'smv_reward',
  'เที่ยวคนเดียว',
  'ให้รางวัลกับตัวเองเมื่อกล้าเปิดชีวิตจริง',
  'ปลดล็อกเมื่อออกเดทจริงสำเร็จ 1 ครั้ง',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'locked'
) on conflict (reward_key) do nothing;
