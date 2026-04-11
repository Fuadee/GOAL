import { SmvDimensionKey } from '@/lib/smv/types';

export const SMV_DIMENSION_LABELS: Record<SmvDimensionKey, string> = {
  confidence: 'เชื่อมั่นในตัวเอง / เป็นผู้นำ',
  look: 'รูปร่างหน้าตา / บุคลิกที่ดี',
  status: 'สถานะสังคม / อำนาจ / เงิน',
  social: 'เครือข่ายสังคม'
};

export const SMV_CHART_LABELS: Record<SmvDimensionKey, string> = {
  confidence: 'เชื่อมั่น/ผู้นำ',
  look: 'รูปร่าง/บุคลิก',
  status: 'สถานะ/อำนาจ/เงิน',
  social: 'เครือข่ายสังคม'
};

export const SMV_FULLY_IMPLEMENTED_DIMENSIONS: SmvDimensionKey[] = ['confidence', 'look', 'status', 'social'];

export const SMV_LEVEL_TARGETS = [60, 75, 85, 95, 100] as const;

export const SMV_METRIC_HINTS: Record<string, string> = {
  situation_coverage: 'จำนวนการลงมือทำจริงในช่วง 30 วัน',
  frame_control: '0-100 จากความนิ่งและการคุมเฟรม',
  leadership_signal: '0-100 จากสัญญาณภาวะผู้นำ',
  consistency: '0-100 จากความสม่ำเสมอ',
  body: 'ระบบด่านร่างกาย 0-3',
  grooming: 'ระบบด่าน grooming 0-3',
  style: 'ระบบด่านการแต่งตัว 0-4',
  income_level: 'รายได้ต่อเดือน (บาท)',
  income_stability: '0-100 จากความเสถียรรายได้',
  status_perception: '0-100 จากภาพลักษณ์สถานะ',
  authority: '0-100 จากอิทธิพลการตัดสินใจ',
  asset_leverage: '0-100 จากการใช้ทรัพย์สิน',
  social_level_progression: 'ระบบด่าน Social 1-10 แบบผ่าน/ไม่ผ่านเท่านั้น'
};
