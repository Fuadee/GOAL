import { SmvConfidenceLevelDefinition, SmvDimensionKey, SmvOverviewDimensionKey } from '@/lib/smv/types';

export type SmvOverviewDimension = {
  key: SmvOverviewDimensionKey;
  dimensionKey: SmvDimensionKey;
  label: string;
};

export const smvOverviewDimensions: SmvOverviewDimension[] = [
  { key: 'confidence', dimensionKey: 'confidence', label: 'เชื่อมั่นในตัวเอง / เป็นผู้นำ' },
  { key: 'appearance', dimensionKey: 'look', label: 'รูปร่างหน้าตา / บุคลิกที่ดี' },
  { key: 'status', dimensionKey: 'status', label: 'สถานะสังคม / อำนาจ / เงิน' },
  { key: 'social_connection', dimensionKey: 'social', label: 'Social Connection' }
];

export const confidenceStageConfig: SmvConfidenceLevelDefinition[] = [
  { level: 1, title: 'เปิดบทสนทนาได้ทันที', description: 'กล้าเริ่มคุยกับคนแปลกหน้าโดยไม่รอจังหวะสมบูรณ์', required_count: 4, action_type: 'confidence_rep' },
  { level: 2, title: 'ยืนเฟรมของตัวเอง', description: 'คุมภาษากาย น้ำเสียง และจังหวะให้มั่นคงต่อเนื่อง', required_count: 5, action_type: 'confidence_rep' },
  { level: 3, title: 'คุยต่อเนื่องไม่หลุด', description: 'พาบทสนทนาไปต่อได้โดยไม่พึ่งคำถามพื้นฐานซ้ำ ๆ', required_count: 6, action_type: 'confidence_rep' },
  { level: 4, title: 'นำการตัดสินใจเล็ก ๆ', description: 'ตัดสินใจแทนกลุ่มในสถานการณ์ง่าย ๆ แล้วพาคนเดินตามได้', required_count: 4, action_type: 'leadership_rep' },
  { level: 5, title: 'รับแรงกดดันระยะสั้น', description: 'โดนท้าทายหรือโดนปฏิเสธแล้วยังรักษาเฟรมได้', required_count: 6, action_type: 'confidence_rep' },
  { level: 6, title: 'นำวงสนทนา', description: 'จัดโฟกัสวงคุยให้คนอื่นตามประเด็นที่กำหนดไว้ได้', required_count: 5, action_type: 'leadership_rep' },
  { level: 7, title: 'ยกระดับความน่าเชื่อถือ', description: 'สื่อสารชัดเจน กระชับ และทำให้คนเชื่อถือการตัดสินใจ', required_count: 5, action_type: 'leadership_rep' },
  { level: 8, title: 'คุมสถานการณ์ท้าทาย', description: 'ในเหตุการณ์กดดันสูงยังนิ่งและเลือกแนวทางได้แม่นยำ', required_count: 6, action_type: 'confidence_rep' },
  { level: 9, title: 'ภาวะผู้นำเชิงระบบ', description: 'มอบหมาย ติดตาม และแก้ปัญหาเป็นระบบจนทีมเดินหน้าต่อได้', required_count: 4, action_type: 'leadership_rep' },
  { level: 10, title: 'ผู้นำที่คงเส้นคงวา', description: 'รักษามาตรฐานความมั่นใจและภาวะผู้นำได้ต่อเนื่องในโลกจริง', required_count: 4, action_type: 'leadership_rep' }
];

export const dimensionStageConfig: Partial<Record<SmvDimensionKey, SmvConfidenceLevelDefinition[]>> = {
  confidence: confidenceStageConfig
};

export function getSmvOverviewDimensions() {
  return smvOverviewDimensions;
}

export function getDimensionDetailStages(dimensionKey: SmvDimensionKey) {
  return dimensionStageConfig[dimensionKey] ?? [];
}

export function getConfidenceStagesConfig() {
  return confidenceStageConfig;
}
