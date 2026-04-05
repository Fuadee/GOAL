# Running Quest System

> **Product Spec + System Design Repository**  
> Repo นี้ถูก reset เพื่อเก็บเฉพาะแนวคิดผลิตภัณฑ์และโครงสร้างระบบ ไม่รวม implementation code

---

## 1) Project Overview

**Running Quest System** คือระบบที่ออกแบบมาเพื่อพาคนธรรมดาไปสู่การวิ่ง **5K** แบบค่อยเป็นค่อยไป ผ่าน game mechanics ที่เข้าใจง่าย

- นี่ **ไม่ใช่** แค่ habit tracker ที่ให้ติ๊กว่า “วันนี้ทำ/ไม่ทำ”
- นี่ **ไม่ใช่** Garmin-style training plan ที่ rigid และกดดัน
- นี่คือ **progressive game system** ที่ทำให้การวิ่งมีเป้าหมาย มีจังหวะ และกลับมาเล่นต่อได้เสมอ

---

## 2) Problem

Pain หลักของคนเริ่มวิ่งไม่ใช่ “ไม่รู้ว่าต้องวิ่ง” แต่คือ “วิ่งแล้วหลุด แล้วกลับมาไม่ได้”

- เริ่มต้นได้ดีช่วงแรก
- พอชีวิตจริงยุ่ง แผนพัง
- รู้สึกตามไม่ทัน / รู้สึกผิด
- สุดท้ายเลิกวิ่งไปเลย

**ปัญหาแกนกลาง:** ระบบส่วนใหญ่ลงโทษคนที่หลุด มากกว่าช่วยให้คนกลับมา

---

## 3) Core Philosophy

ระบบนี้ยึดหลัก 5 ข้อ:

- **No game over** — หลุดได้ แต่จบเกมไม่ได้
- **No punishment** — ไม่มีการลงโทษเมื่อพลาด
- **Progress never lost** — ความพยายามที่ผ่านมาไม่หาย
- **Level = real ability** — เลเวลต้องสะท้อน “ความสามารถจริง”
- **EXP = support system** — EXP คือแรงสนับสนุน ไม่ใช่เครื่องบีบคั้น

---

## 4) Core Systems

### 4.1 Weekly Mission

ผู้ใช้ได้รับภารกิจรายสัปดาห์ที่ยืดหยุ่น และเลือกวันวิ่งเองได้

องค์ประกอบหลัก:
- **EXP target**
- **Sessions target**
- **Distance target**
- **Time target**

แนวคิด:
- ผู้ใช้เลือกเองว่า “วันนี้จะทำ mission ไหนก่อน”
- ทำได้บางส่วนก็ยังถือว่าก้าวหน้า
- ไม่จำเป็นต้อง perfect เพื่อรู้สึกชนะ

### 4.2 Level System

**Level = ความสามารถการวิ่งจริงในโลกจริง**

ตัวอย่าง mapping:
- **Level 1 = วิ่ง 1 km ได้จริง**
- **Level 2 = วิ่ง 2 km ได้จริง**
- ...
- **Level 5 = วิ่ง 5 km ได้จริง**

### 4.3 Level Test

การเลื่อนเลเวลต้องผ่านการทดสอบจริง

- ต้อง “สอบผ่าน” ก่อนเลื่อน
- ถ้ายังไม่ผ่าน = อยู่เลเวลเดิมได้อย่างปลอดภัย
- **ไม่ผ่านไม่โดนลงโทษ**
- ระบบพากลับไปสะสม readiness เพื่อสอบใหม่

---

## 5) Game Loop

ลูปการใช้งานหลักของผู้ใช้:

1. เปิดแอป
2. ดู **Weekly Mission**
3. เลือกว่า “วันนี้จะเล่น mission ไหน”
4. ออกไปวิ่ง
5. บันทึกผลการวิ่ง
6. ได้รับ **EXP**
7. สะสมความพร้อม (**readiness**)
8. เมื่อพร้อม → เข้า **Level Test**

สรุปสั้น ๆ: **Play mission → Gain EXP → Build readiness → Take test → Unlock next level**

---

## 6) Weekly Mission Design

ตัวอย่าง weekly mission (ยืดหยุ่นและจับต้องได้):

- **100 EXP**
- **3 sessions**
- **5 km total distance**
- **40 นาที total active time**

หลักการออกแบบ:
- แต่ละเป้าหมายช่วยกันเสริม (time, distance, consistency)
- คนที่เวลาไม่เยอะก็ยังเคลียร์ภารกิจได้
- คนที่ฟิตขึ้นก็ทำเกินเป้าเพื่อโบนัสได้

---

## 7) EXP System

EXP ถูกออกแบบเป็นแรงเสริมบวก ไม่ใช่แรงกดดัน

ได้ EXP จาก:
- **เวลาในการวิ่ง** (time-based gain)
- **ระยะทางเพิ่ม** (distance bonus)
- **ความสม่ำเสมอ** (consistency bonus)

กติกาสำคัญ:
- **ไม่มีการหัก EXP**
- พลาดวันวิ่ง = แค่ยังไม่ได้ EXP เพิ่ม
- ทุก session ที่ทำ = ความก้าวหน้าที่เก็บสะสม

---

## 8) Level Progression

การโตของผู้ใช้ในระบบนี้ไม่ได้วัดจาก EXP อย่างเดียว

- **EXP สูง ≠ auto level up**
- ต้องมี **readiness** ถึงเกณฑ์
- ต้องผ่าน **Level Test** จริง

ทำไมต้องแบบนี้:
- กันการ “ฟาร์มแต้ม” โดยความสามารถจริงไม่เพิ่ม
- ทำให้เลเวลมีความหมายและน่าเชื่อถือ
- ผู้ใช้มั่นใจว่าเลเวลที่ได้คือของจริง

---

## 9) UX Principles

หลัก UX ที่ต้องรักษา:

- **ไม่กดดัน** (low pressure)
- **ไม่ทำให้รู้สึกผิด** (no guilt tone)
- **เข้าใจง่ายมาก** (clarity first)
- เปิดแอปแล้วต้องรู้ทันทีว่า **“วันนี้ควรทำอะไร”**

Guiding tone ของระบบ:
- Friendly
- Encouraging
- Actionable
- Non-judgmental

---

## 10) Future Implementation Plan

> หมายเหตุ: ส่วนนี้เป็น roadmap สำหรับทีม dev ที่จะ build ต่อ

### Phase 1 (Foundation)

- **Dashboard**
- **Weekly mission module**
- **Run log**

### Phase 2 (Progression Engine)

- **Level test flow**
- **XP/EXP system**

### Phase 3 (Production Data Layer)

- **Supabase integration**
- **Auth**
- **Real user data + persistence**

---

## 11) Key Insight

> **ระบบนี้ไม่ได้ทำให้คุณเก่งขึ้นทันที  
> แต่มันทำให้คุณไม่เลิก**

Running Quest ไม่ได้ขายความเร็ว แต่ขาย “การไปต่อได้เรื่อย ๆ” จนถึงวันที่คุณวิ่ง 5K ได้จริง
