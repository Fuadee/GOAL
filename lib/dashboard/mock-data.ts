import { GoalModuleSummary } from '@/lib/dashboard/types';

export const mockGoalModules: GoalModuleSummary[] = [
  {
    key: 'smv',
    name: 'SMV',
    shortLabel: 'SMV',
    route: '/smv',
    currentScore: 74,
    previousScore: 68,
    targetLabel: 'ยกระดับความมั่นใจและ Social Proof',
    priorityLevel: 'medium',
    interpretation: 'ภาพลักษณ์และความน่าเชื่อถือเริ่มชัดขึ้น แต่ต้องรักษาความต่อเนื่อง',
    mainMetricLabel: 'Confidence / Social Proof',
    mainMetricValue: '74 / 100',
    nextAction: 'โพสต์ผลงานเชิงคุณภาพอย่างน้อย 3 ชิ้นในสัปดาห์นี้',
    progressRatio: 0.62
  },
  {
    key: 'money',
    name: 'Money Management',
    shortLabel: 'Money',
    route: '/money-management',
    currentScore: 78,
    previousScore: 73,
    targetLabel: 'แตะรายได้ 100K ต่อเดือน',
    priorityLevel: 'high',
    interpretation: 'กระแสรายได้ขยับดี แต่ยังต้องเร่ง conversion pipeline',
    mainMetricLabel: 'Monthly Income vs 100K',
    mainMetricValue: '฿78,000 / ฿100,000',
    nextAction: 'ปิดดีลรายได้เพิ่มอีก ฿22,000 ภายในเดือนนี้',
    progressRatio: 0.78
  },
  {
    key: 'health',
    name: 'HealtH',
    shortLabel: 'Health',
    route: '/health',
    currentScore: 46,
    previousScore: 55,
    targetLabel: 'วิ่ง 5 km แบบไม่หยุด',
    priorityLevel: 'high',
    interpretation: 'วินัยการซ้อมตกลงและเริ่มกระทบพลังงานภาพรวม',
    mainMetricLabel: 'Running Streak',
    mainMetricValue: '1 วันต่อเนื่อง',
    nextAction: 'กลับมาวิ่งอย่างน้อย 2 session ภายในสัปดาห์นี้',
    progressRatio: 0.32
  },
  {
    key: 'innovation',
    name: 'Innovation',
    shortLabel: 'Innovation',
    route: '/innovation',
    currentScore: 43,
    previousScore: 47,
    targetLabel: 'ส่งมอบนวัตกรรมให้ครบ 10 ชิ้น',
    priorityLevel: 'medium',
    interpretation: 'มีไอเดียแต่ execution ช้ากว่าแผนที่วางไว้',
    mainMetricLabel: 'Completed Innovations',
    mainMetricValue: '3 / 10',
    nextAction: 'ล็อก 1 โปรเจกต์และปิด prototype ภายใน 10 วัน',
    progressRatio: 0.3
  },
  {
    key: 'world',
    name: 'Heal the WORLD',
    shortLabel: 'World',
    route: '/heal-the-world',
    currentScore: 38,
    previousScore: 38,
    targetLabel: 'ทำ impact action อย่างสม่ำเสมอทุกเดือน',
    priorityLevel: 'medium',
    interpretation: 'เจตนาดีแต่ยังไม่มี action ที่ต่อเนื่องและวัดผลได้',
    mainMetricLabel: 'Impact Actions',
    mainMetricValue: '1 action / เดือน',
    nextAction: 'กำหนดกิจกรรมช่วยเหลือ 2 รายการในเดือนนี้และล็อกวันทันที',
    progressRatio: 0.24
  }
];
