import {
  DashboardAlert,
  GoalModuleKey,
  GoalModuleSummary,
  LifeDirectionStatus,
  MomentumItem,
  TrendStatus
} from '@/lib/dashboard/types';

const MODULE_WEIGHTS: Record<GoalModuleKey, number> = {
  money: 40,
  smv: 20,
  health: 20,
  innovation: 10,
  world: 10
};

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

export const calculateLifeDirectionScore = (modules: GoalModuleSummary[]) => {
  const weightedSum = modules.reduce((sum, module) => {
    return sum + module.currentScore * MODULE_WEIGHTS[module.key];
  }, 0);

  return clampScore(weightedSum / 100);
};

export const getLifeDirectionStatus = (score: number): LifeDirectionStatus => {
  if (score >= 80) return 'กำลังไปได้ดีมาก';
  if (score >= 60) return 'ไปถูกทาง แต่ยังมีจุดต้องเร่ง';
  if (score >= 40) return 'เริ่มหลุดจากเป้าหมาย';
  return 'ต้องรีบปรับทิศทาง';
};

export const getLifeDirectionInterpretation = (score: number) => {
  if (score >= 80) return 'ระบบชีวิตกำลังเดินหน้าได้ดี ให้รักษาความสม่ำเสมอและขยายผลจุดแข็ง';
  if (score >= 60) return 'ภาพรวมยังไปถูกทาง แต่มีบางมิติที่ต้องลงมือเร่งทันทีในสัปดาห์นี้';
  if (score >= 40) return 'เริ่มมีสัญญาณหลุดเป้า ควรลดงานรองและทุ่มพลังให้ 2-3 เรื่องหลัก';
  return 'วิถีปัจจุบันเสี่ยงสูง ต้องรีเซ็ตแผนรายสัปดาห์และกำหนด action ที่ทำได้จริงทุกวัน';
};

export const getTrendStatus = (currentScore: number, previousScore: number): TrendStatus => {
  const diff = currentScore - previousScore;
  if (diff >= 5) return 'improving';
  if (diff <= -5) return 'declining';
  return 'stable';
};

export const buildMomentum = (modules: GoalModuleSummary[]): MomentumItem[] => {
  return modules.map((module) => ({
    moduleKey: module.key,
    moduleName: module.name,
    currentScore: module.currentScore,
    previousScore: module.previousScore,
    change: module.currentScore - module.previousScore,
    trend: getTrendStatus(module.currentScore, module.previousScore)
  }));
};

export const getStrongestModules = (modules: GoalModuleSummary[], take = 2) => {
  return [...modules]
    .sort((a, b) => b.currentScore - a.currentScore)
    .slice(0, take)
    .map((module) => module.shortLabel);
};

export const getWeakestModules = (modules: GoalModuleSummary[], take = 2) => {
  return [...modules]
    .sort((a, b) => a.currentScore - b.currentScore)
    .slice(0, take)
    .map((module) => module.shortLabel);
};

const createLowScoreAlert = (module: GoalModuleSummary): DashboardAlert => ({
  id: `${module.key}-low-score`,
  moduleKey: module.key,
  severity: module.currentScore < 40 ? 'high' : 'medium',
  issueTitle: `${module.name}: คะแนนยังต่ำกว่าเกณฑ์`,
  explanation: `คะแนนปัจจุบันอยู่ที่ ${module.currentScore}% ซึ่งต่ำกว่า baseline ที่ควรคุมไว้`,
  nextAction: `ทำ action หลักที่ขยับเป้า “${module.targetLabel}” ภายใน 72 ชั่วโมง`
});

const createDecliningAlert = (module: GoalModuleSummary): DashboardAlert => ({
  id: `${module.key}-declining`,
  moduleKey: module.key,
  severity: 'high',
  issueTitle: `${module.name}: Momentum ลดลง`,
  explanation: `คะแนนลดลงจาก ${module.previousScore}% เหลือ ${module.currentScore}%`,
  nextAction: 'หยุดงานที่ไม่ critical แล้วจัด 2 session แก้จุดอ่อนภายในสัปดาห์นี้'
});

const createLowProgressAlert = (module: GoalModuleSummary): DashboardAlert => ({
  id: `${module.key}-progress`,
  moduleKey: module.key,
  severity: 'medium',
  issueTitle: `${module.name}: ความคืบหน้าต่อเป้ายังช้า`,
  explanation: `Progress ต่อเป้าอยู่ที่ ${Math.round(module.progressRatio * 100)}% ของ milestone ปัจจุบัน`,
  nextAction: `เร่ง milestone ที่ใกล้สำเร็จที่สุดของ “${module.targetLabel}” ให้จบก่อน`
});

export const generateAlerts = (modules: GoalModuleSummary[]) => {
  const alerts: DashboardAlert[] = [];

  modules.forEach((module) => {
    const trend = getTrendStatus(module.currentScore, module.previousScore);

    if (module.currentScore < 50) {
      alerts.push(createLowScoreAlert(module));
    }

    if (trend === 'declining') {
      alerts.push(createDecliningAlert(module));
    }

    if (module.progressRatio < 0.4) {
      alerts.push(createLowProgressAlert(module));
    }
  });

  return alerts
    .sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, 4);
};
