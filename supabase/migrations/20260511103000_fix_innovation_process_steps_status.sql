-- Fix legacy innovation_process_steps statuses to canonical Kanban statuses.
-- Safe to run repeatedly in Supabase SQL Editor.

-- 1) Ensure note column exists (for legacy environments).
alter table if exists public.innovation_process_steps
  add column if not exists note text;

-- 2) Drop old status check constraint temporarily (if present).
alter table if exists public.innovation_process_steps
  drop constraint if exists innovation_process_steps_status_check;

-- 3) Map legacy/Thai statuses to canonical statuses.
update public.innovation_process_steps
set status = case
  -- completed
  when status is null then 'todo'
  when lower(trim(status)) in ('done', 'completed', 'เสร็จแล้ว', 'สำเร็จ', 'การใช้งานจริง') then 'completed'

  -- in progress
  when lower(trim(status)) in ('doing', 'in_progress', 'กำลังทำ', 'กำลังดำเนินการ') then 'in_progress'

  -- waiting
  when lower(trim(status)) in ('wait', 'waiting', 'รอ', 'รอดำเนินการ') then 'waiting'

  -- blocked
  when lower(trim(status)) in ('block', 'blocked', 'ติดขัด', 'ทำต่อไม่ได้') then 'blocked'

  -- already canonical
  when lower(trim(status)) in ('todo', 'waiting', 'in_progress', 'blocked', 'completed') then lower(trim(status))

  -- fallback
  else 'todo'
end;

-- 4) Extra safety fallback for any non-canonical residual values.
update public.innovation_process_steps
set status = 'todo'
where status is null
   or status not in ('todo', 'waiting', 'in_progress', 'blocked', 'completed');

-- 5) Re-add canonical constraint.
alter table if exists public.innovation_process_steps
  add constraint innovation_process_steps_status_check
  check (status in ('todo', 'waiting', 'in_progress', 'blocked', 'completed'));
