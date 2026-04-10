import { SmvDimensionKey } from '@/lib/smv/types';

export const SMV_DIMENSION_LABELS: Record<SmvDimensionKey, string> = {
  confidence: 'เชื่อมั่นในตัวเอง / เป็นผู้นำ',
  fun: 'สนุกสนาน',
  preselection: 'Pre-selection',
  status: 'สถานะสังคม / อำนาจ / เงิน',
  social: 'Social Connection',
  purpose: 'เป้าหมายชีวิต',
  protection: 'ดูแล / ปกป้องผู้หญิงได้',
  look: 'รูปร่างหน้าตา / บุคลิกที่ดี'
};

export const SMV_FULLY_IMPLEMENTED_DIMENSIONS: SmvDimensionKey[] = ['confidence', 'look', 'status', 'purpose'];

export const SMV_LEVEL_TARGETS = [60, 75, 85, 95, 100] as const;

export const SMV_METRIC_HINTS: Record<string, string> = {
  situation_coverage: 'จำนวน interaction จริงในช่วง 30 วัน',
  frame_control: '0-100 จากคุณภาพการคุมเฟรม',
  emotional_stability: '0-100 จากความนิ่งภายใต้แรงกดดัน',
  leadership_signal: '0-100 จากการนำและตัดสินใจ',
  consistency: '0-100 จากความสม่ำเสมอ',
  body: '0-100 จากสภาพร่างกายและ fitness',
  grooming: '0-100 จากการดูแลรายละเอียด',
  style: '0-100 จากคุณภาพการแต่งตัว',
  cleanliness: '0-100 จากสุขอนามัย',
  presence: '0-100 จากบุคลิก',
  overall_impact: '0-100 จาก impact โดยรวม',
  income_level: 'รายได้ต่อเดือน (บาท)',
  income_stability: '0-100 จากความเสถียรรายได้',
  status_perception: '0-100 จากภาพลักษณ์สถานะ',
  authority: '0-100 จากอิทธิพลการตัดสินใจ',
  asset_leverage: '0-100 จากการใช้ทรัพย์สิน',
  clarity: '0-100 จากความชัดเจนเป้าหมาย',
  execution: '0-100 จากการลงมือทำจริง',
  measurable_progress: '0-100 จากความคืบหน้าที่วัดได้',
  adaptation: '0-100 จากการปรับตัว'
};
