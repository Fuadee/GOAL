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

-- SMV dimensions.
with dimensions as (
  select *
  from (
    values
      ('confidence', 'เชื่อมั่นในตัวเอง / เป็นผู้นำ', 'ภาวะผู้นำ ความมั่นใจ และความนิ่งภายใต้แรงกดดัน', 'cyan'),
      ('fun', 'สนุกสนาน', 'พลังบวกและการสร้างบรรยากาศที่ดี', 'violet'),
      ('preselection', 'Pre-selection', 'social proof และการได้รับการยอมรับในสังคม', 'emerald'),
      ('status', 'สถานะสังคม / อำนาจ / เงิน', 'ภาพรวมความมั่นคง อำนาจ และผลลัพธ์ทางการเงิน', 'amber'),
      ('social', 'Social Connection', 'คุณภาพเครือข่ายและความสัมพันธ์', 'sky'),
      ('purpose', 'เป้าหมายชีวิต', 'ความชัดเจน วิสัยทัศน์ และการลงมือทำอย่างต่อเนื่อง', 'indigo'),
      ('protection', 'ดูแล / ปกป้องผู้หญิงได้', 'ความรับผิดชอบและความพร้อมในการดูแลผู้อื่น', 'rose'),
      ('look', 'รูปร่างหน้าตา / บุคลิกที่ดี', 'รูปร่าง บุคลิก สุขอนามัย และภาพรวมการนำเสนอ', 'fuchsia')
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

insert into public.smv_dimension_scores (dimension_id, score, evidence_count_30d, guard_summary, explanation)
select id, 0, 0, 'ยังไม่มีหลักฐานเพียงพอ', 'เริ่มจากการบันทึกหลักฐานจริงเพื่อให้ระบบคำนวณคะแนน'
from public.smv_dimensions
on conflict (dimension_id) do nothing;

-- Level definitions for each dimension.
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
on conflict (dimension_id, level_score) do update
set
  title = excluded.title,
  requirement_text = excluded.requirement_text;

-- Metrics: fully implemented for confidence, look, status, purpose; scaffold only for others.
with metric_seed as (
  select *
  from (values
    ('confidence', 'situation_coverage', 'Situation Coverage', 'จำนวนสถานการณ์จริงที่พิสูจน์ความมั่นใจ', 'count', 0.20, true),
    ('confidence', 'frame_control', 'Frame Control', 'ความสามารถคุมเฟรม/คุมบทสนทนา', 'score_0_100', 0.25, true),
    ('confidence', 'emotional_stability', 'Emotional Stability', 'ความนิ่งและไม่เสียอาการ', 'score_0_100', 0.20, true),
    ('confidence', 'leadership_signal', 'Leadership Signal', 'การแสดงภาวะผู้นำที่วัดได้', 'score_0_100', 0.20, true),
    ('confidence', 'consistency', 'Consistency', 'ความสม่ำเสมอในช่วง 30 วัน', 'score_0_100', 0.15, true),

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

    ('purpose', 'clarity', 'Clarity', 'ความชัดเจนของเป้าหมายและแผนระยะใกล้', 'score_0_100', 0.20, true),
    ('purpose', 'execution', 'Execution', 'การลงมือทำตามแผนจริง', 'score_0_100', 0.25, true),
    ('purpose', 'measurable_progress', 'Measurable Progress', 'ผลลัพธ์ที่วัดได้ของเป้าหมาย', 'score_0_100', 0.20, true),
    ('purpose', 'consistency', 'Consistency', 'ความต่อเนื่องของการทำงาน', 'score_0_100', 0.20, true),
    ('purpose', 'adaptation', 'Adaptation', 'ความสามารถปรับแผนเมื่อเจออุปสรรค', 'score_0_100', 0.15, true),

    ('fun', 'engagement_quality', 'Engagement Quality', 'Scaffold metric for future expansion', 'score_0_100', 1.00, false),
    ('preselection', 'social_proof', 'Social Proof', 'Scaffold metric for future expansion', 'score_0_100', 1.00, false),
    ('social', 'network_health', 'Network Health', 'Scaffold metric for future expansion', 'score_0_100', 1.00, false),
    ('protection', 'reliability', 'Reliability', 'Scaffold metric for future expansion', 'score_0_100', 1.00, false)
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
