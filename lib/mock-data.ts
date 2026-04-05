import { subDays } from "date-fns";
import type { RunLog, RunningProfile } from "@/types/running";

const toDate = (daysAgo: number) => subDays(new Date(), daysAgo).toISOString().slice(0, 10);

export const mockRunningProfile: RunningProfile = {
  displayName: "DEE",
  targetGoal: "5k",
  currentLevel: 2,
  defaultEnergy: "normal",
  preferredRunsPerWeek: 3,
  recoverySuggestionsEnabled: true
};

export const mockRunLogs: RunLog[] = [
  {
    id: "run-001",
    runDate: toDate(1),
    durationMinutes: 14,
    activityType: "jog",
    effort: "moderate",
    energyToday: "normal",
    notes: "งานเยอะแต่ยังออกไปขยับตัว"
  },
  {
    id: "run-002",
    runDate: toDate(3),
    durationMinutes: 10,
    activityType: "walk",
    effort: "easy",
    energyToday: "low",
    notes: "นอนน้อยเมื่อคืน เลยเลือกเบา ๆ"
  },
  {
    id: "run-003",
    runDate: toDate(6),
    durationMinutes: 18,
    activityType: "jog",
    effort: "moderate",
    energyToday: "normal"
  }
];
