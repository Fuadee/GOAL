import { SmvActionType, SmvConfidenceLevelDefinition } from '@/lib/smv/types';

export const CONFIDENCE_LEVELS: SmvConfidenceLevelDefinition[] = [
  {
    level: 1,
    title: 'กล้าเริ่มก่อน',
    description: 'เริ่มบทสนทนาหรือเริ่มนำสถานการณ์ด้วยตัวเอง',
    required_count: 6,
    action_type: 'confidence_rep'
  },
  {
    level: 2,
    title: 'คุมจังหวะได้',
    description: 'พาบทสนทนาต่อเนื่องโดยไม่หลุดโฟกัส',
    required_count: 8,
    action_type: 'leadership_rep'
  },
  {
    level: 3,
    title: 'นิ่งภายใต้แรงกดดัน',
    description: 'เจอสถานการณ์ท้าทายแล้วยังรักษาเฟรมได้',
    required_count: 8,
    action_type: 'confidence_rep'
  },
  {
    level: 4,
    title: 'นำคนได้จริง',
    description: 'ตัดสินใจและทำให้ทีมเดินตามได้',
    required_count: 6,
    action_type: 'leadership_rep'
  },
  {
    level: 5,
    title: 'ภาวะผู้นำโดดเด่น',
    description: 'คงเส้นคงวาในสถานการณ์จริงที่ยาก',
    required_count: 4,
    action_type: 'leadership_rep'
  }
];

export const MOCK_CONFIDENCE_LOGS: Array<{ action_type: SmvActionType }> = [
  ...Array.from({ length: 5 }, () => ({ action_type: 'confidence_rep' as const })),
  ...Array.from({ length: 3 }, () => ({ action_type: 'leadership_rep' as const }))
];
