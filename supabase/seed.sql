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
