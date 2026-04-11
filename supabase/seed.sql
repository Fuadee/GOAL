-- Development seed data for blood donation dashboard.
-- Replace owner strategy later when auth/RLS is introduced.

insert into public.blood_donation_goals (id, title, target_count, start_date, end_date, status)
values
  ('11111111-1111-1111-1111-111111111111', 'บริจาคเลือดประจำปี 2026', 3, '2026-01-01', '2026-12-31', 'active')
on conflict (id) do nothing;

insert into public.blood_donation_events (id, goal_id, planned_date, actual_date, status, location, note)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', '2026-01-12', '2026-01-12', 'completed', 'ศูนย์บริการโลหิตแห่งชาติ', 'ครั้งแรกของปีนี้'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '2026-04-02', null, 'planned', 'โรงพยาบาลใกล้บ้าน', 'นัดกับเพื่อนร่วมทีม'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', '2026-02-10', null, 'planned', 'หน่วยรับบริจาคเคลื่อนที่', 'ยังไม่ได้ไปตามแผน'),
  ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', '2025-09-20', '2025-09-21', 'completed', 'โรงพยาบาลจังหวัด', 'บริจาคหลังตรวจสุขภาพ')
on conflict (id) do nothing;

-- Runner quest seed levels and default level progress.
insert into public.runner_levels (level_number, title, distance_target_km, pace_target_seconds_per_km, sort_order)
values
  (1, '1 km', 1, 600, 1),
  (2, '2 km', 2, 570, 2),
  (3, '3 km', 3, 540, 3),
  (4, '4 km', 4, 510, 4),
  (5, '5 km', 5, 480, 5)
on conflict (level_number) do update
set
  title = excluded.title,
  distance_target_km = excluded.distance_target_km,
  pace_target_seconds_per_km = excluded.pace_target_seconds_per_km,
  sort_order = excluded.sort_order;

insert into public.runner_level_progress (level_id, status)
select
  level.id,
  case
    when level.level_number = 1 then 'available'
    else 'locked'
  end as status
from public.runner_levels as level
on conflict (level_id) do nothing;

-- SMV dimensions (4 core powers only).
with dimensions as (
  select *
  from (
    values
      ('confidence', 'เชื่อมั่นในตัวเอง / เป็นผู้นำ', 'ภาวะผู้นำ ความมั่นใจ และความนิ่งภายใต้แรงกดดัน', 'cyan'),
      ('look', 'รูปร่างหน้าตา / บุคลิกที่ดี', 'รูปร่าง บุคลิก สุขอนามัย และภาพรวมการนำเสนอ', 'fuchsia'),
      ('status', 'สถานะสังคม / อำนาจ / เงิน', 'ภาพรวมความมั่นคง อำนาจ และผลลัพธ์ทางการเงิน', 'amber'),
    ('social', 'เครือข่ายสังคม', 'ระบบด่านเครือข่ายและความสัมพันธ์แบบ mission progression', 'sky')
  ) as t(key, label, description, color_token)
)
insert into public.smv_dimensions (key, label, description, color_token)
select key, label, description, color_token
from dimensions
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  color_token = excluded.color_token;

delete from public.smv_dimensions where key not in ('confidence', 'look', 'status', 'social');

insert into public.smv_dimension_scores (dimension_id, score, evidence_count_30d, guard_summary, explanation)
select id, 0, 0, 'ยังไม่มีหลักฐานเพียงพอ', 'เริ่มจากการบันทึกหลักฐานจริงเพื่อให้ระบบคำนวณคะแนน'
from public.smv_dimensions
on conflict (dimension_id) do nothing;

with level_base as (
  select * from (values
    (60, 'Foundation', 'มีพฤติกรรมที่สม่ำเสมอในระดับพื้นฐาน'),
    (75, 'Reliable', 'ทำได้ต่อเนื่องและเริ่มมีผลลัพธ์ชัดเจน'),
    (85, 'Strong', 'มีหลักฐานเชิงคุณภาพและเชิงปริมาณรองรับ'),
    (95, 'Elite', 'รักษามาตรฐานสูงภายใต้สถานการณ์จริงที่กดดัน'),
    (100, 'Exceptional', 'ระดับสูงสุดที่มีหลักฐานหนักแน่นต่อเนื่อง')
  ) as t(level_score, title, requirement_text)
)
insert into public.smv_level_definitions (dimension_id, level_score, title, requirement_text)
select d.id, l.level_score, l.title, l.requirement_text
from public.smv_dimensions d
cross join level_base l
where d.key <> 'confidence'
on conflict (dimension_id, level_score) do update
set
  title = excluded.title,
  requirement_text = excluded.requirement_text;

with metric_seed as (
  select *
  from (values
    ('look', 'body', 'Body', 'คุณภาพรูปร่างจากการดูแลต่อเนื่อง', 'score_0_100', 0.20, true),
    ('look', 'grooming', 'Grooming', 'การดูแลทรงผม หนวดเครา ผิว และรายละเอียด', 'score_0_100', 0.20, true),
    ('look', 'style', 'Style', 'ความเหมาะสมและความคมของการแต่งตัว', 'score_0_100', 0.15, true),
    ('look', 'cleanliness', 'Cleanliness', 'สุขอนามัยและความสะอาดโดยรวม', 'score_0_100', 0.15, true),
    ('look', 'presence', 'Presence', 'บุคลิก ท่าทาง และแรงดึงดูดเวลาเข้าสังคม', 'score_0_100', 0.15, true),
    ('look', 'overall_impact', 'Overall Impact', 'ภาพรวมที่คนรับรู้เมื่อเจอคุณ', 'score_0_100', 0.15, true),

    ('status', 'income_level', 'Income Level', 'รายได้เฉลี่ยต่อเดือน', 'currency_monthly', 0.30, true),
    ('status', 'income_stability', 'Income Stability', 'เสถียรภาพรายได้ย้อนหลัง', 'score_0_100', 0.20, true),
    ('status', 'status_perception', 'Status Perception', 'ภาพลักษณ์สถานะที่คนรอบตัวรับรู้', 'score_0_100', 0.20, true),
    ('status', 'authority', 'Authority', 'อิทธิพลในการตัดสินใจและภาวะนำเชิงสังคม', 'score_0_100', 0.15, true),
    ('status', 'asset_leverage', 'Asset Leverage', 'การใช้ทรัพย์สินเพื่อสร้างความได้เปรียบ', 'score_0_100', 0.15, true),

    ('confidence', 'situation_coverage', 'Situation Coverage', 'จำนวนสถานการณ์จริงที่ลงมือ', 'count', 0.35, true),
    ('confidence', 'frame_control', 'Frame Control', 'ความนิ่งและการคุมเฟรม', 'score_0_100', 0.25, true),
    ('confidence', 'leadership_signal', 'Leadership Signal', 'สัญญาณภาวะผู้นำในสถานการณ์จริง', 'score_0_100', 0.25, true),
    ('confidence', 'consistency', 'Consistency', 'ความสม่ำเสมอของการกล้านำ', 'score_0_100', 0.15, true)
  ) as t(dimension_key, key, label, description, value_type, weight, is_required)
)
insert into public.smv_metrics (dimension_id, key, label, description, value_type, weight, is_required)
select d.id, m.key, m.label, m.description, m.value_type, m.weight, m.is_required
from metric_seed m
join public.smv_dimensions d on d.key = m.dimension_key
on conflict (dimension_id, key) do update
set
  label = excluded.label,
  description = excluded.description,
  value_type = excluded.value_type,
  weight = excluded.weight,
  is_required = excluded.is_required;

delete from public.smv_metrics
where dimension_id in (
  select id from public.smv_dimensions where key in ('confidence', 'look', 'status', 'social')
)
and key not in (
  'body','grooming','style','cleanliness','presence','overall_impact',
  'income_level','income_stability','status_perception','authority','asset_leverage',
  'situation_coverage','frame_control','leadership_signal','consistency'
);

delete from public.smv_metrics
where dimension_id in (
  select id from public.smv_dimensions where key = 'social'
);

delete from public.smv_level_definitions
where dimension_id in (
  select id from public.smv_dimensions where key = 'social'
);

insert into public.social_levels (id, title, description, phase, score)
values
  (1, 'เปิดวงสนทนา', 'เริ่มต้นคุยกับคนใหม่อย่างเป็นธรรมชาติ', 'Survival', 10),
  (2, 'สร้างความคุ้นเคย', 'มีการ follow-up ภายใน 48 ชั่วโมง', 'Survival', 10),
  (3, 'นัดเจอครั้งแรก', 'เปลี่ยนจากแชทเป็นการเจอจริงอย่างน้อย 1 ครั้ง', 'Survival', 10),
  (4, 'มีตัวตนในวง', 'มีบทบาทเชิงบวกในกลุ่ม/คอมมูนิตี้', 'Presence', 10),
  (5, 'ความน่าเชื่อถือ', 'คนในวงเริ่มนึกถึงคุณเมื่อมีโอกาสหรือปัญหา', 'Presence', 10),
  (6, 'เชื่อมคนกับคน', 'แนะนำคนที่เหมาะสมให้กันและเกิดผลจริง', 'Influence', 10),
  (7, 'สร้างโอกาสร่วม', 'ร่วมโปรเจกต์ กิจกรรม หรือดีลร่วมกับเครือข่าย', 'Influence', 10),
  (8, 'มีอิทธิพลเชิงบวก', 'สามารถขับเคลื่อนบทสนทนา/การตัดสินใจในวง', 'Influence', 10),
  (9, 'ขยายแรงส่ง', 'เครือข่ายของคุณเริ่มชวนคนใหม่เข้ามาโดยไม่ต้องร้องขอ', 'Leverage', 10),
  (10, 'Mission Network Elite', 'เครือข่ายแข็งแรง สร้างผลลัพธ์ต่อเนื่อง และยั่งยืน', 'Leverage', 10)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  phase = excluded.phase,
  score = excluded.score;

with social_requirement_seed as (
  select * from (values
    (1, 'เริ่มแชทใหม่อย่างน้อย 3 คนในสัปดาห์นี้', 'metric', '3'),
    (2, 'ส่ง follow-up ให้ครบอย่างน้อย 2 คน', 'metric', '2'),
    (3, 'มี meetup อย่างน้อย 1 ครั้ง', 'evidence', '1'),
    (4, 'เข้าร่วมกิจกรรมกลุ่มและมีส่วนร่วมชัดเจน 1 ครั้ง', 'manual', null),
    (5, 'ได้รับ feedback เชิงบวกเรื่องความน่าเชื่อถืออย่างน้อย 1 เคส', 'evidence', '1'),
    (6, 'แนะนำ connection ที่มีประโยชน์และเกิดการคุยต่อ', 'evidence', '1'),
    (7, 'เริ่ม collaboration กับคนในเครือข่ายอย่างน้อย 1 งาน', 'manual', null),
    (8, 'มีหลักฐานการนำวงคุย/ผลักดันการตัดสินใจอย่างน้อย 1 ครั้ง', 'evidence', '1'),
    (9, 'มีคนแนะนำ connection ใหม่ให้คุณโดยตรงอย่างน้อย 2 คน', 'metric', '2'),
    (10, 'รักษาวงคุณภาพสูงต่อเนื่อง 30 วัน พร้อมหลักฐานประกอบ', 'manual', '30_days')
  ) as t(level_id, requirement_text, requirement_type, required_value)
)
insert into public.social_requirements (level_id, requirement_text, requirement_type, required_value)
select level_id, requirement_text, requirement_type, required_value
from social_requirement_seed
where not exists (
  select 1 from public.social_requirements sr
  where sr.level_id = social_requirement_seed.level_id
    and sr.requirement_text = social_requirement_seed.requirement_text
);

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
