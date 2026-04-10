export const SMV_AXIS_KEYS = [
  'confidence_leadership',
  'fun_emotion',
  'pre_selection',
  'status_money_power',
  'social_connection',
  'mission_purpose',
  'protector_provider',
  'looks_presence'
] as const;

export type SmvAxisKey = (typeof SMV_AXIS_KEYS)[number];

export const SMV_AXIS_LABELS: Record<SmvAxisKey, string> = {
  confidence_leadership: 'เชื่อมั่นในตัวเอง / เป็นผู้นำ',
  fun_emotion: 'สนุกสนาน',
  pre_selection: 'Pre-selection',
  status_money_power: 'สถานะสังคม / อำนาจ / เงิน',
  social_connection: 'Social Connection',
  mission_purpose: 'เป้าหมายชีวิต',
  protector_provider: 'ดูแล / ปกป้องผู้หญิงได้',
  looks_presence: 'รูปร่างหน้าตา / บุคลิกที่ดี'
};

export const SMV_AXIS_META = SMV_AXIS_KEYS.map((key) => ({
  key,
  label: SMV_AXIS_LABELS[key]
}));

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
  confidence_leadership: 'ควรเพิ่มความมั่นใจและการตัดสินใจนำ',
  fun_emotion: 'ควรเพิ่มพลังบวก ความลื่นไหล และความสนุก',
  pre_selection: 'ควรเพิ่ม social proof และ interaction จริง',
  status_money_power: 'ควรเสริมภาพลักษณ์ความมั่นคงและสถานะ',
  social_connection: 'ควรขยายเครือข่ายและเจอคนเพิ่ม',
  mission_purpose: 'ควรทำเป้าหมายชีวิตให้ชัดและเดินหน้าต่อเนื่อง',
  protector_provider: 'ควรพัฒนาความรับผิดชอบและความสามารถในการดูแล',
  looks_presence: 'ควรลงทุนกับรูปร่าง บุคลิก และการแต่งตัว'
};

function getAxisByFrameworkOrder(axisKey: SmvAxisKey) {
  return SMV_AXIS_KEYS.indexOf(axisKey);
}

function byScoreDesc(a: SmvDashboardAxis, b: SmvDashboardAxis) {
  if (b.score !== a.score) {
    return b.score - a.score;
  }

  return getAxisByFrameworkOrder(a.key) - getAxisByFrameworkOrder(b.key);
}

function byScoreAsc(a: SmvDashboardAxis, b: SmvDashboardAxis) {
  if (a.score !== b.score) {
    return a.score - b.score;
  }

  return getAxisByFrameworkOrder(a.key) - getAxisByFrameworkOrder(b.key);
}

export function getSortedAxes(scores: SmvScores, mode: 'framework' | 'score' = 'framework') {
  const axes = SMV_AXIS_META.map((axis) => ({
    key: axis.key,
    label: axis.label,
    score: scores[axis.key]
  }));

  if (mode === 'score') {
    return [...axes].sort(byScoreDesc);
  }

  return axes;
}

export function getStrongestAxes(scores: SmvScores, count = 2): SmvAxisKey[] {
  return getSortedAxes(scores, 'score')
    .slice(0, count)
    .map((axis) => axis.key);
}

export function getWeakestAxes(scores: SmvScores, count = 2): SmvAxisKey[] {
  return getSortedAxes(scores, 'framework')
    .sort((a, b) => byScoreAsc(a, b))
    .slice(0, count)
    .map((axis) => axis.key);
}

export function getAxisTier(axisKey: SmvAxisKey, scores: SmvScores): SmvAxisTier {
  const strongestAxes = getStrongestAxes(scores);
  if (strongestAxes.includes(axisKey)) {
    return 'strength';
  }

  const weakestAxes = getWeakestAxes(scores);
  if (weakestAxes.includes(axisKey)) {
    return 'weakness';
  }

  return 'balanced';
}

// Temporary sample data structure (ready to be swapped with Supabase payload later)
export const SMV_SAMPLE_PROFILE: SmvScores = {
  confidence_leadership: 82,
  fun_emotion: 74,
  pre_selection: 67,
  status_money_power: 78,
  social_connection: 71,
  mission_purpose: 88,
  protector_provider: 69,
  looks_presence: 76
};

export function buildSmvDashboardData(scores: SmvScores): SmvDashboardData {
  const axes = getSortedAxes(scores, 'framework');

  const totalScore = Math.round(axes.reduce((sum, item) => sum + item.score, 0) / axes.length);
  const strongestAxes = getStrongestAxes(scores).map((key) => axes.find((axis) => axis.key === key)!);
  const weakestAxes = getWeakestAxes(scores).map((key) => axes.find((axis) => axis.key === key)!);

  return {
    axes,
    totalScore,
    strongestAxis: strongestAxes[0],
    strongestAxes,
    weakestAxes
  };
}
