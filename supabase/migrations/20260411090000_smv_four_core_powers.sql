-- Introduce canonical 4-core SMV dimensions while preserving existing data.

insert into public.smv_dimensions (key, label, description, color_token)
values
  ('confidence', 'เชื่อมั่นในตัวเอง / เป็นผู้นำ', 'ภาวะผู้นำ ความมั่นใจ และความนิ่งภายใต้แรงกดดัน', 'cyan'),
  ('look', 'รูปร่างหน้าตา / บุคลิกที่ดี', 'รูปร่าง บุคลิก สุขอนามัย และภาพรวมการนำเสนอ', 'fuchsia'),
  ('status', 'สถานะสังคม / อำนาจ / เงิน', 'ภาพรวมความมั่นคง อำนาจ และผลลัพธ์ทางการเงิน', 'amber'),
  ('social', 'Social Connection', 'คุณภาพเครือข่ายและความสัมพันธ์', 'sky')
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  color_token = excluded.color_token;
