create table if not exists public.smv_dimensions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  description text,
  color_token text,
  created_at timestamptz not null default now()
);

create table if not exists public.smv_checklist_items (
  id uuid primary key default gen_random_uuid(),
  dimension_id uuid not null references public.smv_dimensions(id) on delete cascade,
  title text not null,
  description text,
  score_delta integer not null,
  frequency_type text not null check (frequency_type in ('daily', 'repeatable', 'one_time')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.smv_checklist_logs (
  id uuid primary key default gen_random_uuid(),
  dimension_id uuid not null references public.smv_dimensions(id) on delete cascade,
  checklist_item_id uuid not null references public.smv_checklist_items(id) on delete cascade,
  completed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.smv_score_events (
  id uuid primary key default gen_random_uuid(),
  dimension_id uuid not null references public.smv_dimensions(id) on delete cascade,
  event_type text not null check (event_type in ('checklist', 'manual_adjustment', 'system_recalc')),
  score_before integer not null,
  score_delta integer not null,
  score_after integer not null,
  reason text,
  checklist_log_id uuid references public.smv_checklist_logs(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.smv_dimension_scores (
  dimension_id uuid primary key references public.smv_dimensions(id) on delete cascade,
  current_score integer not null default 50 check (current_score between 0 and 100),
  previous_score integer not null default 50 check (previous_score between 0 and 100),
  updated_at timestamptz not null default now()
);

create index if not exists smv_checklist_items_dimension_idx on public.smv_checklist_items (dimension_id, sort_order);
create unique index if not exists smv_checklist_items_dimension_title_uidx on public.smv_checklist_items (dimension_id, title);
create index if not exists smv_checklist_logs_dimension_created_idx on public.smv_checklist_logs (dimension_id, created_at desc);
create index if not exists smv_checklist_logs_completed_idx on public.smv_checklist_logs (completed_at desc);
create index if not exists smv_score_events_dimension_created_idx on public.smv_score_events (dimension_id, created_at desc);
create index if not exists smv_score_events_created_idx on public.smv_score_events (created_at desc);

insert into public.smv_dimensions (key, label, description, color_token)
values
  ('confidence_leadership', 'เชื่อมั่นในตัวเอง / เป็นผู้นำ', 'ภาวะผู้นำ ความมั่นใจ และการตัดสินใจ', 'cyan'),
  ('fun_playful', 'สนุกสนาน', 'พลังงานบวก ความขี้เล่น และการสร้างบรรยากาศ', 'violet'),
  ('preselection', 'Pre-selection', 'social proof และภาพความน่าเชื่อถือทางสังคม', 'emerald'),
  ('status_money', 'สถานะสังคม / อำนาจ / เงิน', 'ความมั่นคง ความรับผิดชอบ และภาพลักษณ์สถานะ', 'amber'),
  ('social_connection', 'Social Connection', 'ความสามารถในการสร้างสัมพันธ์และเครือข่าย', 'sky'),
  ('life_goal', 'เป้าหมายชีวิต', 'ความชัดเจนของทิศทางชีวิตและการลงมือทำ', 'indigo'),
  ('protective_capable', 'ดูแล / ปกป้องผู้หญิงได้', 'ความสามารถในการดูแล ปกป้อง และเป็นที่พึ่ง', 'rose'),
  ('looks_style', 'รูปร่างหน้าตา / บุคลิกที่ดี', 'การดูแลบุคลิก สุขภาพ และการแต่งกาย', 'fuchsia')
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  color_token = excluded.color_token;

insert into public.smv_dimension_scores (dimension_id, current_score, previous_score)
select id, 50, 50
from public.smv_dimensions
on conflict (dimension_id) do nothing;

with checklist_seed as (
  select * from (
    values
      ('confidence_leadership', 'Started a difficult conversation', 'เริ่มบทสนทนาที่ยากแต่จำเป็น', 3, 'repeatable', 1),
      ('confidence_leadership', 'Led a decision instead of hesitating', 'ตัดสินใจนำทีมแทนการลังเล', 2, 'repeatable', 2),
      ('confidence_leadership', 'Avoided eye contact / looked unsure', 'หลบตา หรือดูไม่มั่นใจ', -2, 'daily', 3),
      ('fun_playful', 'Made someone laugh', 'ทำให้คนรอบตัวหัวเราะ', 2, 'repeatable', 1),
      ('fun_playful', 'Created a fun atmosphere in conversation', 'สร้างบรรยากาศสนุกในบทสนทนา', 2, 'repeatable', 2),
      ('fun_playful', 'Stayed too serious all day', 'จริงจังเกินไปทั้งวัน', -1, 'daily', 3),
      ('preselection', 'Posted real social proof', 'โพสต์ social proof ที่เป็นธรรมชาติ', 1, 'daily', 1),
      ('preselection', 'Had visible positive interaction in public/social setting', 'มีปฏิสัมพันธ์เชิงบวกที่คนอื่นมองเห็น', 3, 'repeatable', 2),
      ('preselection', 'Disappeared socially for too long', 'หายจากวงสังคมนานเกินไป', -2, 'daily', 3),
      ('status_money', 'Advanced an income or career target', 'ขยับเป้ารายได้หรืองานให้คืบหน้า', 3, 'daily', 1),
      ('status_money', 'Managed money intentionally today', 'วางแผน/จัดการเงินอย่างมีวินัย', 2, 'daily', 2),
      ('status_money', 'Made avoidable impulsive spending', 'ใช้เงินฟุ่มเฟือยที่เลี่ยงได้', -2, 'daily', 3),
      ('social_connection', 'Reached out to someone meaningful', 'ทักหรือเชื่อมต่อกับคนสำคัญ', 2, 'daily', 1),
      ('social_connection', 'Joined a new social activity/group', 'เข้าร่วมกิจกรรมหรือกลุ่มใหม่', 3, 'repeatable', 2),
      ('social_connection', 'Isolated all day without reason', 'เก็บตัวทั้งวันโดยไม่มีเหตุผล', -2, 'daily', 3),
      ('life_goal', 'Completed top priority task', 'ทำงานสำคัญที่สุดของวันสำเร็จ', 3, 'daily', 1),
      ('life_goal', 'Reviewed weekly direction and next action', 'ทบทวนทิศทางรายสัปดาห์และแผนถัดไป', 2, 'daily', 2),
      ('life_goal', 'Spent day with no intentional progress', 'ไม่มีความคืบหน้าตามเป้าหมาย', -2, 'daily', 3),
      ('protective_capable', 'Helped solve someone’s practical problem', 'ช่วยแก้ปัญหาเชิงปฏิบัติให้คนอื่น', 2, 'repeatable', 1),
      ('protective_capable', 'Improved personal reliability/preparedness', 'เพิ่มความพร้อมและความน่าเชื่อถือของตัวเอง', 2, 'daily', 2),
      ('protective_capable', 'Ignored important responsibility', 'ละเลยความรับผิดชอบสำคัญ', -3, 'daily', 3),
      ('looks_style', 'Dressed intentionally and well', 'แต่งตัวตั้งใจและเหมาะสม', 2, 'daily', 1),
      ('looks_style', 'Completed training/fitness routine', 'ออกกำลังกายหรือดูแลรูปร่างตามแผน', 2, 'daily', 2),
      ('looks_style', 'Neglected grooming', 'ละเลยการดูแลบุคลิก/ความสะอาด', -2, 'daily', 3)
  ) as t(dimension_key, title, description, score_delta, frequency_type, sort_order)
)
insert into public.smv_checklist_items (dimension_id, title, description, score_delta, frequency_type, sort_order, is_active)
select d.id, s.title, s.description, s.score_delta, s.frequency_type, s.sort_order, true
from checklist_seed s
join public.smv_dimensions d on d.key = s.dimension_key
on conflict (dimension_id, title) do update
set
  description = excluded.description,
  score_delta = excluded.score_delta,
  frequency_type = excluded.frequency_type,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
