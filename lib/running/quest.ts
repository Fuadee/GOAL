import { differenceInCalendarDays, endOfWeek, isWithinInterval, parseISO, startOfWeek } from "date-fns";
import type {
  LevelTest,
  MissionChoice,
  RunningMode,
  RunLog,
  WeeklyMission,
  WeeklyProgress
} from "@/types/running";

const WEEKLY_MISSIONS: Record<number, WeeklyMission> = {
  1: { level: 1, expTarget: 60, sessionsTarget: 2, distanceTargetKm: 1, timeTargetMin: 20 },
  2: { level: 2, expTarget: 100, sessionsTarget: 3, distanceTargetKm: 3, timeTargetMin: 35 },
  3: { level: 3, expTarget: 140, sessionsTarget: 3, distanceTargetKm: 5, timeTargetMin: 50 },
  4: { level: 4, expTarget: 180, sessionsTarget: 4, distanceTargetKm: 8, timeTargetMin: 70 },
  5: { level: 5, expTarget: 220, sessionsTarget: 4, distanceTargetKm: 12, timeTargetMin: 90 }
};

const LEVEL_TEST_TARGETS: Record<number, number> = {
  1: 0.5,
  2: 1,
  3: 2,
  4: 3,
  5: 5
};

export function getDaysSinceLastRun(runLogs: RunLog[], baseDate = new Date()): number | null {
  if (!runLogs.length) return null;

  const latestDate = [...runLogs]
    .map((log) => parseISO(log.runDate).getTime())
    .sort((a, b) => b - a)[0];

  return differenceInCalendarDays(baseDate, new Date(latestDate));
}

export function getCurrentMode(daysSinceLastRun: number | null): RunningMode {
  if (daysSinceLastRun === null) return "recovery";
  if (daysSinceLastRun <= 1) return "normal";
  if (daysSinceLastRun <= 3) return "slip";
  return "recovery";
}

export function calculateRunXP({
  durationMinutes,
  distanceKm,
  weeklySessionIndex
}: {
  durationMinutes: number;
  distanceKm: number;
  weeklySessionIndex: number;
}): number {
  const baseExp =
    durationMinutes >= 30 ? 50 : durationMinutes >= 20 ? 40 : durationMinutes >= 15 ? 30 : durationMinutes >= 10 ? 20 : durationMinutes >= 5 ? 10 : 0;

  const distanceBonus =
    distanceKm >= 5 ? 30 : distanceKm >= 3 ? 20 : distanceKm >= 2 ? 15 : distanceKm >= 1 ? 10 : distanceKm >= 0.5 ? 5 : 0;

  const consistencyBonus = weeklySessionIndex === 2 ? 5 : weeklySessionIndex === 3 ? 10 : 0;

  return baseExp + distanceBonus + consistencyBonus;
}

export function getWeeklyMissionForLevel(level: number): WeeklyMission {
  return WEEKLY_MISSIONS[level] ?? WEEKLY_MISSIONS[5];
}

export function getTodayMissionChoices({ level, mode }: { level: number; mode: RunningMode }): MissionChoice[] {
  const intensity = Math.max(0, level - 1) * 0.2;

  const easy: MissionChoice = {
    type: "easy",
    label: "Easy Run",
    durationRangeMin: [8 + Math.round(intensity * 3), 12 + Math.round(intensity * 5)],
    distanceRangeKm: [0.5 + intensity, 1 + intensity],
    expectedExp: 20 + Math.round(intensity * 8),
    suitableModes: ["normal", "slip", "recovery"],
    recommended: mode === "recovery"
  };

  const standard: MissionChoice = {
    type: "standard",
    label: "Standard Run",
    durationRangeMin: [12 + Math.round(intensity * 3), 18 + Math.round(intensity * 6)],
    distanceRangeKm: [1 + intensity, 1.8 + intensity],
    expectedExp: 35 + Math.round(intensity * 10),
    suitableModes: ["normal", "slip"],
    recommended: mode === "normal"
  };

  const push: MissionChoice = {
    type: "push",
    label: "Push Run",
    durationRangeMin: [18 + Math.round(intensity * 4), 25 + Math.round(intensity * 7)],
    distanceRangeKm: [1.8 + intensity, 2.5 + intensity * 1.2],
    expectedExp: 50 + Math.round(intensity * 12),
    suitableModes: ["normal"],
    recommended: false
  };

  return [easy, standard, push];
}

export function getWeeklyProgress(runLogs: RunLog[], currentWeek = new Date()): WeeklyProgress {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const thisWeekLogs = runLogs.filter((log) =>
    isWithinInterval(parseISO(log.runDate), {
      start: weekStart,
      end: weekEnd
    })
  );

  return {
    exp: thisWeekLogs.reduce((sum, log) => sum + log.xpEarned, 0),
    sessions: thisWeekLogs.length,
    distanceKm: Number(thisWeekLogs.reduce((sum, log) => sum + log.distanceKm, 0).toFixed(2)),
    timeMin: thisWeekLogs.reduce((sum, log) => sum + log.durationMinutes, 0)
  };
}

export function getLevelReadiness({
  level,
  weeklyProgress
}: {
  level: number;
  weeklyProgress: WeeklyProgress;
}) {
  const mission = getWeeklyMissionForLevel(level);

  const requirements = [
    {
      key: "exp",
      label: "EXP",
      current: weeklyProgress.exp,
      target: mission.expTarget,
      unit: "",
      passed: weeklyProgress.exp >= mission.expTarget
    },
    {
      key: "sessions",
      label: "Sessions",
      current: weeklyProgress.sessions,
      target: mission.sessionsTarget,
      unit: "ครั้ง",
      passed: weeklyProgress.sessions >= mission.sessionsTarget
    },
    {
      key: "distance",
      label: "Distance",
      current: weeklyProgress.distanceKm,
      target: mission.distanceTargetKm,
      unit: "km",
      passed: weeklyProgress.distanceKm >= mission.distanceTargetKm
    },
    {
      key: "time",
      label: "Time",
      current: weeklyProgress.timeMin,
      target: mission.timeTargetMin,
      unit: "นาที",
      passed: weeklyProgress.timeMin >= mission.timeTargetMin
    }
  ];

  const missing = requirements
    .filter((requirement) => !requirement.passed)
    .map((requirement) => ({
      ...requirement,
      remaining: Number((requirement.target - requirement.current).toFixed(2))
    }));

  return {
    ready: missing.length === 0,
    requirements,
    missing
  };
}

export function canStartLevelTest({ level, weeklyProgress }: { level: number; weeklyProgress: WeeklyProgress }) {
  return getLevelReadiness({ level, weeklyProgress }).ready;
}

export function getLevelTestTarget(level: number) {
  const targetLevel = Math.min(5, level + 1);
  return {
    targetLevel,
    distanceKm: LEVEL_TEST_TARGETS[targetLevel]
  };
}

export function getTestResult({
  targetLevel,
  distanceKm,
  completed
}: {
  targetLevel: number;
  distanceKm: number;
  completed: boolean;
}): Pick<LevelTest, "passed"> & { message: string } {
  const required = LEVEL_TEST_TARGETS[targetLevel] ?? LEVEL_TEST_TARGETS[5];
  const passed = completed && distanceKm >= required;

  return {
    passed,
    message: passed
      ? `ผ่านการทดสอบระดับ ${targetLevel} แล้ว!`
      : "ยังไม่พร้อมตอนนี้ แต่ progress ของคุณยังอยู่"
  };
}

export function getCoachingMessage({
  mode,
  readiness,
  level
}: {
  mode: RunningMode;
  readiness: boolean;
  level: number;
}) {
  if (readiness) {
    return `ยอดเยี่ยม! คุณพร้อมทดสอบระดับ ${Math.min(level + 1, 5)} แล้ว`;
  }

  if (mode === "recovery") {
    return "วันนี้ไม่จำเป็นต้องชนะ แค่กลับมาเก็บ progress แบบเบา ๆ ก็พอ";
  }

  if (mode === "slip") {
    return "หลุดไปไม่เป็นไร Level ของคุณยังอยู่ แค่สะสมความพร้อมต่อ";
  }

  return "ยังไม่พร้อมสอบวันนี้ไม่เป็นไร สะสมอีกนิดแล้วค่อยไปต่อ";
}
