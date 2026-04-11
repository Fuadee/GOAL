import { SmvDimensionKey, SmvOverviewDimensionKey } from '@/lib/smv/types';

export type SmvOverviewDimension = {
  key: SmvOverviewDimensionKey;
  dimensionKey: SmvDimensionKey;
  label: string;
};

export const smvOverviewDimensions: SmvOverviewDimension[] = [
  { key: 'confidence', dimensionKey: 'confidence', label: 'เชื่อมั่นในตัวเอง / เป็นผู้นำ' },
  { key: 'appearance', dimensionKey: 'look', label: 'รูปร่างหน้าตา / บุคลิกที่ดี' },
  { key: 'status', dimensionKey: 'status', label: 'สถานะสังคม / อำนาจ / เงิน' },
  { key: 'social_connection', dimensionKey: 'social', label: 'เครือข่ายสังคม' }
];

export function getSmvOverviewDimensions() {
  return smvOverviewDimensions;
}
