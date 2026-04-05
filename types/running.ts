export type EnergyLevel = "low" | "normal" | "high";
export type RunningMode = "normal" | "slip" | "recovery";
export type ActivityType = "walk" | "jog" | "run";
export type EffortType = "easy" | "moderate" | "hard";
export type MissionType = "easy" | "standard" | "push";

export interface RunLog {
  id: string;
  runDate: string;
  durationMinutes: number;
  distanceKm: number;
  activityType: ActivityType;
  effort: EffortType;
  energyToday?: EnergyLevel;
  missionType?: MissionType;
  xpEarned: number;
  notes?: string;
}

export interface LevelTest {
  id: string;
  targetLevel: number;
  testDistanceKm: number;
  durationMinutes?: number;
  passed: boolean;
  notes?: string;
  createdAt: string;
}

export interface RunningProfile {
  displayName: string;
  targetGoal: "5k";
  currentLevel: number;
  currentXp: number;
  preferredRunsPerWeek: number;
  preferredRunDays?: string[];
  recoveryEnabled: boolean;
  defaultEnergy?: EnergyLevel;
  recoverySuggestionsEnabled?: boolean;
}

export interface WeeklyMission {
  level: number;
  expTarget: number;
  sessionsTarget: number;
  distanceTargetKm: number;
  timeTargetMin: number;
}

export interface WeeklyProgress {
  exp: number;
  sessions: number;
  distanceKm: number;
  timeMin: number;
}

export interface MissionChoice {
  type: MissionType;
  label: string;
  durationRangeMin: [number, number];
  distanceRangeKm: [number, number];
  expectedExp: number;
  suitableModes: RunningMode[];
  recommended: boolean;
}

export interface TodayPlan {
  title: string;
  durationRange: string;
  focus: string;
  coachMessage: string;
}
