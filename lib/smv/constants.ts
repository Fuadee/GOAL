export const SMV_AXIS_KEYS = ['confidence_leadership', 'looks_presence', 'status_money_power', 'social_connection'] as const;

export type SmvAxisKey = (typeof SMV_AXIS_KEYS)[number];

export const SMV_AXIS_LABELS: Record<SmvAxisKey, string> = {
  confidence_leadership: 'เชื่อมั่นในตัวเอง / เป็นผู้นำ',
  looks_presence: 'รูปร่างหน้าตา / บุคลิกที่ดี',
  status_money_power: 'สถานะสังคม / อำนาจ / เงิน',
  social_connection: 'เครือข่ายสังคม'
};

export const SMV_AXIS_META = SMV_AXIS_KEYS.map((key) => ({ key, label: SMV_AXIS_LABELS[key] }));

export type SmvScores = Record<SmvAxisKey, number>;
export type SmvAxisTier = 'strength' | 'weakness' | 'balanced';

export type SmvDashboardAxis = {
  key: SmvAxisKey;
  label: string;
  score: number;
};

export type SmvDashboardData = {
  axes: SmvDashboardAxis[];
  totalScore: number;
  strongestAxis: SmvDashboardAxis;
  strongestAxes: SmvDashboardAxis[];
  weakestAxes: SmvDashboardAxis[];
};

export const SMV_AXIS_INSIGHTS: Record<SmvAxisKey, string> = {
  confidence_leadership: 'เพิ่มความมั่นใจและการตัดสินใจเชิงผู้นำ',
  looks_presence: 'ยกระดับรูปลักษณ์และบุคลิกให้คมขึ้น',
  status_money_power: 'สร้างความมั่นคง ผลลัพธ์ และอิทธิพลที่วัดได้',
  social_connection: 'ขยายเครือข่ายแบบด่าน 1–10 พร้อมหลักฐานเชิงภารกิจ'
};

export function getSortedAxes(scores: SmvScores, mode: 'framework' | 'score' = 'framework') {
  const axes = SMV_AXIS_META.map((axis) => ({ ...axis, score: scores[axis.key] }));
  if (mode === 'score') return [...axes].sort((a, b) => b.score - a.score);
  return axes;
}

export function getStrongestAxes(scores: SmvScores, count = 1): SmvAxisKey[] {
  return getSortedAxes(scores, 'score').slice(0, count).map((axis) => axis.key);
}

export function getWeakestAxes(scores: SmvScores, count = 1): SmvAxisKey[] {
  return [...getSortedAxes(scores, 'score')].reverse().slice(0, count).map((axis) => axis.key);
}

export function getAxisTier(axisKey: SmvAxisKey, scores: SmvScores): SmvAxisTier {
  if (getStrongestAxes(scores).includes(axisKey)) return 'strength';
  if (getWeakestAxes(scores).includes(axisKey)) return 'weakness';
  return 'balanced';
}

export const SMV_SAMPLE_PROFILE: SmvScores = {
  confidence_leadership: 62,
  looks_presence: 58,
  status_money_power: 54,
  social_connection: 49
};

export function buildSmvDashboardData(scores: SmvScores): SmvDashboardData {
  const axes = getSortedAxes(scores, 'framework');
  const totalScore = Math.round(axes.reduce((sum, item) => sum + item.score, 0) / axes.length);
  const strongestAxes = getStrongestAxes(scores).map((key) => axes.find((axis) => axis.key === key)!);
  const weakestAxes = getWeakestAxes(scores).map((key) => axes.find((axis) => axis.key === key)!);

  return { axes, totalScore, strongestAxis: strongestAxes[0], strongestAxes, weakestAxes };
}
