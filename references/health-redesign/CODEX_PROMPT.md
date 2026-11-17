# GOAL Health — 10-Level Running Achievement System

คุณเป็น senior full-stack engineer + product UI engineer ให้ทำงานใน Repository GOAL ตัวจริงที่เปิดอยู่เท่านั้น ไม่สร้างโปรเจกต์ใหม่ ไม่ deploy โดยไม่ได้รับอนุญาต

## Outcome
แทนที่ระบบ Health 5 Levels เดิมด้วยระบบ 10 Levels สำหรับเป้าหมายวิ่ง 5 กม. pace 8:00 นาที/กม. (40:00 นาที) โดยรักษาประวัติการวิ่งเดิมทั้งหมดและส่วนอื่นของแอปไว้ครบ ออกแบบ UI/UX หน้า Health แบบ Neon Sport ใช้งานจริงทั้ง desktop/mobile มี effects แต่ไม่รบกวนการใช้งาน

## ก่อนแก้โค้ด (บังคับ)
- สำรวจ routing /health, framework, component, models, storage, auth, migrations, existing tests, deployment architecture และ logic 5 Levels เดิมใน Repository จริง
- ตรวจแหล่งข้อมูลจริงและ schema ก่อนเสนอ migration ห้ามสมมุติว่าเป็น SQLite/Supabase/localStorage โดยไม่ตรวจ
- ระบุว่าหน้า prototype และภาพ reference เป็นเพียงแนวทาง ไม่ใช่ source of truth หรือฐานข้อมูลจริง
- ทำแผนแก้แบบสั้นและเริ่มลงมือทันทีใน branch ที่ปลอดภัย ตรวจ diff ก่อนและหลัง ไม่เปลี่ยนโมดูลอื่นโดยไม่จำเป็น

## กติกา 10 Levels ที่ตกลงกัน
L1: วิ่งต่อเนื่อง ≥1.0 กม.; ไม่จำกัด pace
L2: วิ่งต่อเนื่อง ≥2.0 กม.; ไม่จำกัด pace
L3: วิ่งต่อเนื่อง ≥2.5 กม.; ไม่จำกัด pace
L4: วิ่งต่อเนื่อง ≥3.0 กม.; ไม่จำกัด pace
L5: วิ่งต่อเนื่อง ≥4.0 กม.; ไม่จำกัด pace
L6: ทำระยะ ≥5.0 กม. แบบวิ่งหรือวิ่งสลับเดินได้; ไม่จำกัด pace หรือเวลารวม (การเดินอย่างเดียวไม่ถือว่าผ่าน)
L7: วิ่งต่อเนื่อง ≥5.0 กม.; ไม่จำกัด pace
L8: วิ่งต่อเนื่อง ≥5.0 กม.; pace เฉลี่ย ≤10:00 นาที/กม. (เท่ากับ 5 กม. ภายใน 50:00)
L9: วิ่งต่อเนื่อง ≥5.0 กม.; pace เฉลี่ย ≤9:00 นาที/กม. (เท่ากับ 5 กม. ภายใน 45:00)
L10: วิ่งต่อเนื่อง ≥5.0 กม.; pace เฉลี่ย ≤8:00 นาที/กม. (เท่ากับ 5 กม. ภายใน 40:00)

เงื่อนไข L8–L10 ให้คิดจากระยะทางและเวลารวมที่บันทึกจริงโดย pace = elapsed_seconds / distance_km ไม่ตัดสินจากเวลารวมคงที่ 50/45/40 นาทีเมื่อวิ่ง >5 กม. ถ้าไม่มี split data ให้ใช้ pace เฉลี่ยทั้งหมดและอธิบายกฎใน UI; ห้ามสร้าง 5K split time ขึ้นเอง

กติกาสำคัญ:
- Progress Level = จำนวนระดับที่ผ่านจาก 10; distance progress = ระยะทางสูงสุด/5 กม. แยกกัน ห้ามเอา 40.2% ที่เป็น distance progress ไปแสดงว่าเป็น Level progress
- คำนวณจากประวัติที่มีหลักฐานรองรับทั้งหมด ไม่ขึ้นกับลำดับการกรอกหรือวันที่; การวิ่งครั้งเดียวสามารถทำให้หลายระดับเข้าเกณฑ์ได้จริง แต่การแสดงความก้าวหน้าหลักให้เป็นเส้นทางต่อเนื่อง L1→L10: current = Level แรกที่ยังขาดหลักฐาน หากมีผลงานที่เข้าเกณฑ์ Level สูงกว่าแต่ Level ก่อนหน้ายังไม่ผ่าน ให้แสดงเป็น “ทำเงื่อนไขนี้ได้แล้ว / รอ Level ก่อนหน้า” โดยไม่ทิ้งหลักฐานเดิม เมื่อผ่านด่านก่อนหน้าให้ปลดล็อกย้อนหลังโดยอัตโนมัติ
- สถานะ Done/Current/Locked ชัด; มีคำอธิบายว่าขาดระยะ / ยังต้องวิ่งต่อเนื่อง / pace ยังไม่ถึงเป้า เมื่อผลไม่ผ่าน
- ไม่ยึดผลเดือน เม.ย. 2569 ว่าเป็นสมรรถนะปัจจุบัน: เก็บ historical best กับ latest run แยกกัน และไม่สร้างข้อมูลวิ่งที่ไม่มีจริง
- หลีกเลี่ยงความคลาดเคลื่อน floating point: บันทึก elapsed time เป็นจำนวนวินาที แสดง pace format mm:ss และใช้การเปรียบเทียบโดยไม่ปัดค่าก่อนตรวจผ่าน
- หากข้อมูลเก่าไม่มีหลักฐานเรื่องวิ่งต่อเนื่อง ห้ามสมมุติว่าต่อเนื่อง; ทำ compatibility mapping/migration อย่างระมัดระวัง พร้อมแสดง unknown หากจำเป็น

## บันทึกผลวิ่ง
รองรับวันที่, ระยะทาง กม., เวลารวม (mm:ss หรือ hh:mm:ss), pace คำนวณอัตโนมัติ, สถานะ วิ่งต่อเนื่อง / วิ่งสลับเดิน (และป้องกันเดินล้วนถูกนับเป็น run-walk หากต้องเพิ่มชนิดกิจกรรม), หมายเหตุ; รองรับข้อมูลรูปแบบเดิมที่ระบุ pace แต่ไม่ทำลายข้อมูลเก่า; validation สำหรับระยะติดลบ, 00:00, input ไม่ถูกต้อง, ค่าประหลาด; สร้าง แก้ไข ลบตาม permission และ behavior เดิม โดยกรณีลบ/แก้ไขต้อง recalculation ระดับอย่างถูกต้อง

## UI / UX (ดู references)
- 01-design-neon-sport.png ใช้เป็นภาพอ้างอิง mood/visual hierarchy เท่านั้น ห้ามคัดลอกข้อความหรือกราฟจำลองจากภาพเป็นข้อมูลจริง
- 02-neon-effects-prototype.html เป็น effect/UI prototype ไม่ใช่ logic ล่าสุด และไม่ใช่ codebase จริง
- 03-original-health-page.pdf ใช้ดู field/history ในหน้าเดิม
- ทำหน้าจอ Health แบบ dark charcoal, neon lime, premium sports dashboard; hero แสดง goal 5K/40:00, two distinct progress metrics, Current Level, latest run, personal best; roadmap 10 stages, run-log, history, กราฟจากข้อมูลจริง; ไม่วาดกราฟ mock data เป็นข้อมูลผู้ใช้
- effects เช่น glow, subtle flowing light, progress count-up, interactive level hover, button micro-interactions โดยปรับให้ใช้จริง, ไม่กะพริบรุนแรง, accessibility contrast, focus, keyboard, prefers-reduced-motion, mobile performance และ user toggle effects ถ้าเหมาะสม
- ใช้ asset ภายใน project อย่างถูกลิขสิทธิ์/ภายใต้สิทธิ์ และ optimize ก่อน production ไม่เอา screenshot ทั้งภาพมาแปะเป็น UI

## In scope / out of scope
IN: Levels rules, run logging, automatic unlock, data-safe migration, responsive neon dashboard, run history, best/latest statistics, testing
OUT (เด็ดขาด): Training Plan Engine, ตารางฝึก, scheduling, calendar of workouts, daily recommendations, reminders, speed workout prescriptions, สร้างโปรเจกต์ใหม่, เปลี่ยน auth หรือแก้ระบบอื่นโดยไม่เกี่ยวข้อง

## Quality / verification (บังคับ)
- สำรอง/ป้องกันข้อมูลจริงและวาง migration แบบ backward compatible ไม่ลบ reset หรือ seed ทับประวัติ 7 records เดิม
- เขียน unit tests rules ทั้ง 10 ระดับ, run-walk allowed L6 but not L7, 5K pace thresholds, long-distance time calculation, historical unlocks, invalid inputs, missing nonstop state, edit/delete recomputation
- ทดสอบอย่างน้อย: 2.01 กม. 17:25 nonstop -> L1-L2; กรณีมี L1-L2 แล้ววิ่ง 5 กม. run-walk อย่างเดียว -> เก็บหลักฐาน L6 แต่ current ยังเป็น L3; 5 กม. 60:00 run-walk -> L6; 5 กม. 60:00 nonstop -> L7; 5 กม. 50:00 nonstop -> L8; 5 กม. 45:00 nonstop -> L9; 5 กม. 40:00 nonstop -> L10; 5 กม. 40:01 nonstop -> ไม่ผ่าน L10; 5.5 กม. 44:00 nonstop -> L10 โดย average pace 8:00/km
- ทดสอบ desktop/mobile, loading, empty state, history, data retention, accessibility, existing app navigation, run relevant lint/typecheck/tests/build; report failures explicitly
- ห้าม push/deploy/mutate production DB โดยไม่รับอนุญาต; ส่ง summary files changed, migrations, tests + results, remaining risks, rollout steps

เริ่มจากตรวจโค้ดใน Repository ปัจจุบันและ implementation ของ /health ก่อน จากนั้นลงมือแก้ไขและทดสอบจนพร้อมให้รีวิว ถ้ามีปัญหาเชิงข้อมูลที่ทำให้ migration ไม่ปลอดภัยให้หยุดเฉพาะขั้นตอนนั้นและอธิบาย blocker โดยยังทำส่วนอื่นที่ปลอดภัยต่อได้
