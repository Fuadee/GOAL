import { SmvConfidenceLevelDefinition } from '@/lib/smv/types';

export const CONFIDENCE_LEVELS = [
  {
    level: 1,
    title: 'Small Talk คนแปลกหน้า',
    description: 'เปิดปากคุยกับคนที่ไม่รู้จัก',
    required_count: 20,
    action_type: 'smalltalk_any'
  },
  {
    level: 2,
    title: 'Small Talk ผู้หญิง',
    description: 'คุยกับผู้หญิงแบบมี interaction',
    required_count: 15,
    action_type: 'smalltalk_female'
  },
  {
    level: 3,
    title: 'ทักผู้หญิงที่รู้สึกว่าสวย',
    description: 'เข้าไปทักคนที่คุณรู้สึกกดดัน',
    required_count: 10,
    action_type: 'approach_high_value'
  },
  {
    level: 4,
    title: 'คุยต่อเนื่อง 2–3 นาที',
    description: 'คุย flow ไม่ใช่แค่ทักแล้วจบ',
    required_count: 10,
    action_type: 'conversation_long'
  },
  {
    level: 5,
    title: 'Rejection Immunity',
    description: 'โดนปฏิเสธแล้วเข้าใหม่ทันที',
    required_count: 15,
    action_type: 'rejection'
  },
  {
    level: 6,
    title: 'ขอ IG ตอนกลางวัน',
    description: 'ขอ contact หลังจากคุย',
    required_count: 10,
    action_type: 'close_day'
  },
  {
    level: 7,
    title: 'ขอ IG ในสถานการณ์กดดัน',
    description: 'ร้านเหล้า / มีเพื่อน / คนเยอะ',
    required_count: 10,
    action_type: 'close_night'
  },
  {
    level: 8,
    title: 'คุม interaction ได้',
    description: 'ไม่ลน ไม่ impress คุม flow ได้',
    required_count: 10,
    action_type: 'interaction_control'
  },
  {
    level: 9,
    title: 'Frame Control',
    description: 'ไม่เสียความมั่นใจแม้โดน test',
    required_count: 10,
    action_type: 'frame_control'
  },
  {
    level: 10,
    title: 'Perfect Game',
    description: 'มั่นใจเต็ม แม้โดนกด และสามารถ close ได้',
    required_count: 1,
    action_type: 'perfect_game'
  }
] as const satisfies readonly SmvConfidenceLevelDefinition[];

export function getConfidenceLevels() {
  return CONFIDENCE_LEVELS;
}

export function validateConfidenceLevelsInDev() {
  if (process.env.NODE_ENV === 'production') return;

  if (CONFIDENCE_LEVELS.length !== 10) {
    throw new Error(`[SMV] CONFIDENCE_LEVELS must contain exactly 10 levels, got ${CONFIDENCE_LEVELS.length}`);
  }

  const expectedLevels = Array.from({ length: 10 }, (_, index) => index + 1);
  const actualLevels = CONFIDENCE_LEVELS.map((level) => level.level).sort((a, b) => a - b);
  const hasAllLevels = expectedLevels.every((value, index) => actualLevels[index] === value);

  if (!hasAllLevels) {
    throw new Error(`[SMV] CONFIDENCE_LEVELS must contain level numbers 1-10. Got: ${actualLevels.join(', ')}`);
  }

  const seenActionTypes = new Set<string>();
  for (const level of CONFIDENCE_LEVELS) {
    if (seenActionTypes.has(level.action_type)) {
      throw new Error(`[SMV] CONFIDENCE_LEVELS has duplicate action_type: ${level.action_type}`);
    }
    seenActionTypes.add(level.action_type);
  }
}
