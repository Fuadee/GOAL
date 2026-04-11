import { SmvDimensionKey } from '@/lib/smv/types';

export const SMV_DIMENSION_LABELS: Record<SmvDimensionKey, string> = {
  confidence: 'เชื่อมั่นในตัวเอง / เป็นผู้นำ',
  look: 'รูปร่างหน้าตา / บุคลิกที่ดี',
  status: 'สถานะสังคม / อำนาจ / เงิน',
  social: 'Social Connection'
};

export const SMV_CHART_LABELS: Record<SmvDimensionKey, string> = {
  confidence: 'เชื่อมั่น/ผู้นำ',
  look: 'รูปร่าง/บุคลิก',
  status: 'สถานะ/อำนาจ/เงิน',
  social: 'Social Connection'
};

export const SMV_FULLY_IMPLEMENTED_DIMENSIONS: SmvDimensionKey[] = ['confidence', 'look', 'status', 'social'];

export const SMV_LEVEL_TARGETS = [60, 75, 85, 95, 100] as const;

export const SMV_METRIC_HINTS: Record<string, string> = {
  situation_coverage: 'จำนวนการลงมือทำจริงในช่วง 30 วัน',
  frame_control: '0-100 จากความนิ่งและการคุมเฟรม',
  leadership_signal: '0-100 จากสัญญาณภาวะผู้นำ',
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
  network_health: '0-100 จากคุณภาพเครือข่าย',
  social_depth: '0-100 จากความลึกของความสัมพันธ์',
  introductions: 'จำนวนการเชื่อมคนใหม่ต่อเดือน',
  reliability: '0-100 จากความน่าเชื่อถือในสังคม'
};
