export type EnergyLevel = "low" | "normal" | "high";
export type RunningMode = "normal" | "slip" | "recovery";
export type ActivityType = "walk" | "jog" | "run";
export type EffortType = "easy" | "moderate" | "hard";

export interface RunLog {
  id: string;
  runDate: string;
  durationMinutes: number;
  activityType: ActivityType;
  effort: EffortType;
  energyToday?: EnergyLevel;
  notes?: string;
}

export interface RunningProfile {
  displayName: string;
  targetGoal: "5k";
  currentLevel: number;
  defaultEnergy: EnergyLevel;
  preferredRunsPerWeek: number;
  recoverySuggestionsEnabled: boolean;
}

export interface TodayPlan {
  title: string;
  durationRange: string;
  focus: string;
  coachMessage: string;
}
