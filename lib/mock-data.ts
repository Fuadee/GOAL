import { subDays } from "date-fns";
import type { LevelTest, RunLog, RunningProfile } from "@/types/running";
import { calculateRunXP } from "@/lib/running/quest";

const toDate = (daysAgo: number) => subDays(new Date(), daysAgo).toISOString().slice(0, 10);

const buildRunLog = ({
  id,
  daysAgo,
  durationMinutes,
  distanceKm,
  activityType,
  effort,
  missionType,
  notes,
  weeklySessionIndex,
  energyToday
}: {
  id: string;
  daysAgo: number;
  durationMinutes: number;
  distanceKm: number;
  activityType: RunLog["activityType"];
  effort: RunLog["effort"];
  missionType?: RunLog["missionType"];
  notes?: string;
  weeklySessionIndex: number;
  energyToday?: RunLog["energyToday"];
}): RunLog => ({
  id,
  runDate: toDate(daysAgo),
  durationMinutes,
  distanceKm,
  activityType,
  effort,
  missionType,
  energyToday,
  xpEarned: calculateRunXP({ durationMinutes, distanceKm, weeklySessionIndex }),
  notes
});

export const mockRunningProfile: RunningProfile = {
  displayName: "DEE",
  targetGoal: "5k",
  currentLevel: 2,
  currentXp: 285,
  preferredRunsPerWeek: 3,
  preferredRunDays: ["Mon", "Wed", "Sat"],
  recoveryEnabled: true
};

export const mockRunLogs: RunLog[] = [
  buildRunLog({
    id: "run-001",
    daysAgo: 1,
    durationMinutes: 16,
    distanceKm: 1.7,
    activityType: "jog",
    effort: "moderate",
    missionType: "standard",
    weeklySessionIndex: 2,
    energyToday: "normal",
    notes: "งานเยอะแต่กลับมาเก็บ progress ได้"
  }),
  buildRunLog({
    id: "run-002",
    daysAgo: 3,
    durationMinutes: 12,
    distanceKm: 1.1,
    activityType: "jog",
    effort: "easy",
    missionType: "easy",
    weeklySessionIndex: 1,
    energyToday: "low",
    notes: "เน้นกลับมาสม่ำเสมอ"
  }),
  buildRunLog({
    id: "run-003",
    daysAgo: 5,
    durationMinutes: 22,
    distanceKm: 2.3,
    activityType: "run",
    effort: "hard",
    missionType: "push",
    weeklySessionIndex: 3,
    energyToday: "high",
    notes: "ลองกด pace ดู"
  }),
  buildRunLog({
    id: "run-004",
    daysAgo: 9,
    durationMinutes: 10,
    distanceKm: 0.8,
    activityType: "walk",
    effort: "easy",
    missionType: "easy",
    weeklySessionIndex: 2
  })
];

export const mockLevelTests: LevelTest[] = [
  {
    id: "test-001",
    targetLevel: 2,
    testDistanceKm: 1,
    durationMinutes: 9,
    passed: true,
    notes: "ผ่านแบบมั่นใจ",
    createdAt: toDate(15)
  },
  {
    id: "test-002",
    targetLevel: 3,
    testDistanceKm: 1.6,
    durationMinutes: 14,
    passed: false,
    notes: "ยังไม่พร้อม แต่ไม่ถอย",
    createdAt: toDate(7)
  }
];

export const demoStates = {
  notReady: { exp: 45, sessions: 1, distanceKm: 0.9, timeMin: 16 },
  ready: { exp: 112, sessions: 3, distanceKm: 3.5, timeMin: 40 },
  testPassed: { targetLevel: 3, distanceKm: 2.1, completed: true },
  testFailed: { targetLevel: 3, distanceKm: 1.2, completed: true }
};
