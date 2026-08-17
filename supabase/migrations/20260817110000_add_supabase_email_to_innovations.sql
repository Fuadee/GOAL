alter table if exists public.innovations
  add column if not exists supabase_email text;

comment on column public.innovations.supabase_email is
  'Email address used for the Innovation Supabase account.';
