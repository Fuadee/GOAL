create table if not exists public.goal_vision_images (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  goal_key text not null check (goal_key in ('smv', 'money', 'health', 'innovation', 'world')),
  image_path text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, goal_key)
);

create index if not exists goal_vision_images_user_id_idx on public.goal_vision_images (user_id);
create index if not exists goal_vision_images_goal_key_idx on public.goal_vision_images (goal_key);

alter table public.goal_vision_images enable row level security;

create policy "goal_vision_images_service_role_all"
  on public.goal_vision_images
  as permissive
  for all
  to service_role
  using (true)
  with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'goal-vision-images',
  'goal-vision-images',
  true,
  8388608,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
