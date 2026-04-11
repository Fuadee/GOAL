export type GoalModuleKey = 'smv' | 'money' | 'health' | 'innovation' | 'world';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type SeverityLevel = 'high' | 'medium' | 'low';

export type GoalModuleSummary = {
  key: GoalModuleKey;
  name: string;
  shortLabel: string;
  route: string;
  currentScore: number;
  previousScore: number;
  targetLabel: string;
  priorityLevel: PriorityLevel;
  interpretation: string;
  mainMetricLabel: string;
  mainMetricValue: string;
  nextAction: string;
  progressRatio: number;
};

export type LifeDirectionStatus =
  | 'กำลังไปได้ดีมาก'
  | 'ไปถูกทาง แต่ยังมีจุดต้องเร่ง'
  | 'เริ่มหลุดจากเป้าหมาย'
  | 'ต้องรีบปรับทิศทาง';

export type LifeDirectionSummary = {
  score: number;
  status: LifeDirectionStatus;
  interpretation: string;
};

export type FocusItem = {
  id: string;
  title: string;
  reason: string;
  target: string;
  status: 'On Track' | 'At Risk' | 'Critical';
};

export type DashboardAlert = {
  id: string;
  moduleKey: GoalModuleKey;
  severity: SeverityLevel;
  issueTitle: string;
  explanation: string;
  nextAction: string;
};

export type BalancePoint = {
  axis: 'Money' | 'SMV' | 'Health' | 'Innovation' | 'World';
  value: number;
};

export type DashboardData = {
  generatedAt: string;
  activeGoals: number;
  modules: GoalModuleSummary[];
  lifeDirection: LifeDirectionSummary;
  balancePoints: BalancePoint[];
  strongestAreas: string[];
  weakestAreas: string[];
  focusItems: FocusItem[];
  alerts: DashboardAlert[];
};
