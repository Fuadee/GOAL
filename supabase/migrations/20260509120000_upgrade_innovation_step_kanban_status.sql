alter table if exists public.innovation_process_steps
  add column if not exists note text;

update public.innovation_process_steps
set status = 'completed'
where status = 'done';

alter table if exists public.innovation_process_steps
  drop constraint if exists innovation_process_steps_status_check;

alter table if exists public.innovation_process_steps
  add constraint innovation_process_steps_status_check
  check (status in ('todo', 'waiting', 'in_progress', 'blocked', 'completed'));
