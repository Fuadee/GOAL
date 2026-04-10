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

export type SmvDashboardAxis = {
  key: SmvAxisKey;
  label: string;
  score: number;
};

export type SmvDashboardData = {
  axes: SmvDashboardAxis[];
  totalScore: number;
  strongestAxis: SmvDashboardAxis;
  weakestAxes: SmvDashboardAxis[];
};

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
  const axes = SMV_AXIS_META.map((axis) => ({
    key: axis.key,
    label: axis.label,
    score: scores[axis.key]
  }));

  const totalScore = Math.round(axes.reduce((sum, item) => sum + item.score, 0) / axes.length);
  const sortedByScore = [...axes].sort((a, b) => a.score - b.score);

  return {
    axes,
    totalScore,
    strongestAxis: sortedByScore[sortedByScore.length - 1],
    weakestAxes: sortedByScore.slice(0, 2)
  };
}
