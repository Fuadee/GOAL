create table if not exists public.smv_stage_definitions (
  id uuid primary key default gen_random_uuid(),
  dimension_key text not null,
  stage_number integer not null check (stage_number between 1 and 20),
  stage_key text not null,
  title_th text not null,
  description_th text not null,
  action_hint_th text not null,
  score_value integer not null check (score_value between 0 and 100),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(dimension_key, stage_key),
  unique(dimension_key, stage_number)
);

create table if not exists public.smv_stage_progress (
  id uuid primary key default gen_random_uuid(),
  dimension_key text not null,
  stage_key text not null,
  status text not null check (status in ('NOT_STARTED', 'IN_PROGRESS', 'PASSED')),
  passed_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(dimension_key, stage_key)
);

create index if not exists smv_stage_definitions_dimension_sort_idx
  on public.smv_stage_definitions (dimension_key, sort_order);

create index if not exists smv_stage_progress_dimension_status_idx
  on public.smv_stage_progress (dimension_key, status);

create trigger set_smv_stage_definitions_updated_at
before update on public.smv_stage_definitions
for each row execute function public.set_updated_at_timestamp();

create trigger set_smv_stage_progress_updated_at
before update on public.smv_stage_progress
for each row execute function public.set_updated_at_timestamp();

insert into public.smv_stage_definitions (
  dimension_key,
  stage_number,
  stage_key,
  title_th,
  description_th,
  action_hint_th,
  score_value,
  sort_order,
  is_active
)
values
  ('confidence', 1, 'confidence_stage_1_start', 'กล้าเริ่ม', 'กล้าเข้าไปเริ่มต้นสถานการณ์ด้วยตัวเอง ไม่รอ ไม่ถอย', 'เริ่มคุยก่อนหรือเริ่มนำก่อนให้ได้อย่างน้อย 1 ครั้ง', 20, 1, true),
  ('confidence', 2, 'confidence_stage_2_control', 'คุมบทสนทนา', 'ไม่ใช่แค่เริ่มได้ แต่พาสถานการณ์ต่อได้', 'นำบทสนทนาต่อเนื่องและไม่ปล่อยให้บทสนทนาตาย 1 ครั้ง', 20, 2, true),
  ('confidence', 3, 'confidence_stage_3_pressure', 'เจอแรงกดดัน', 'อยู่ในสถานการณ์ที่กดดันแล้วยังไม่หลุด', 'อยู่ในบรรยากาศกดดันและคุมตัวเองให้นิ่งได้ 1 ครั้ง', 20, 3, true),
  ('confidence', 4, 'confidence_stage_4_rejection', 'รับมือการปฏิเสธ', 'โดนปฏิเสธจริงแล้วไม่เสียตัวตน', 'หลังโดนปฏิเสธให้กลับมายืนระยะได้โดยไม่เสียอาการ 1 ครั้ง', 20, 4, true),
  ('confidence', 5, 'confidence_stage_5_lead', 'เป็นผู้นำ', 'ไม่ได้แค่คุมตัวเอง แต่ทำให้คนอื่น follow ได้', 'ตัดสินใจนำสถานการณ์จริงและทำให้คนอื่นตอบสนองตาม direction', 20, 5, true)
on conflict (dimension_key, stage_key) do update
set
  stage_number = excluded.stage_number,
  title_th = excluded.title_th,
  description_th = excluded.description_th,
  action_hint_th = excluded.action_hint_th,
  score_value = excluded.score_value,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.smv_stage_progress (dimension_key, stage_key, status)
select dimension_key, stage_key, 'NOT_STARTED'
from public.smv_stage_definitions
where dimension_key = 'confidence'
on conflict (dimension_key, stage_key) do nothing;

-- Remove metric-based confidence scoring configuration only.
with confidence_dimension as (
  select id from public.smv_dimensions where key = 'confidence' limit 1
), deleted_metrics as (
  delete from public.smv_metrics
  where dimension_id in (select id from confidence_dimension)
  returning id
)
delete from public.smv_evidence_metric_values
where metric_id in (select id from deleted_metrics);

delete from public.smv_level_definitions
where dimension_id in (select id from public.smv_dimensions where key = 'confidence');

delete from public.smv_score_history
where dimension_id in (select id from public.smv_dimensions where key = 'confidence');
