export type RunnerProgressStatus = 'locked' | 'available' | 'passed';

export type RunnerRunResult = 'passed' | 'failed_distance' | 'failed_pace' | 'failed_stopped' | 'failed_multiple';

export type RunnerEffort = 'easy' | 'normal' | 'hard';

export type RunnerLevel = {
  id: string;
  level_number: number;
  title: string;
  distance_target_km: number;
  pace_target_seconds_per_km: number;
  sort_order: number;
  created_at: string;
};

export type RunnerRunLog = {
  id: string;
  level_id: string;
  run_date: string;
  distance_km: number;
  duration_seconds: number;
  pace_seconds_per_km: number;
  no_stop: boolean;
  note: string | null;
  effort: RunnerEffort | null;
  result: RunnerRunResult;
  created_at: string;
  level?: Pick<RunnerLevel, 'id' | 'level_number' | 'title'>;
};

export type RunnerLevelProgress = {
  id: string;
  level_id: string;
  status: RunnerProgressStatus;
  best_distance_km: number | null;
  best_pace_seconds_per_km: number | null;
  best_no_stop_distance_km: number | null;
  passed_at: string | null;
  updated_at: string;
};

export type RunAttemptInput = {
  run_date: string;
  distance_km: number;
  duration_seconds: number;
  pace_seconds_per_km: number;
  no_stop: boolean;
  note?: string;
  effort?: RunnerEffort;
};

export type RunAttemptEvaluation = {
  result: RunnerRunResult;
  passed: boolean;
  distanceRemainingKm: number;
  paceDeltaSeconds: number;
  unmetConditions: Array<'distance' | 'pace' | 'no_stop'>;
};

export type RunnerDashboardLevel = RunnerLevel & {
  progress: RunnerLevelProgress | null;
  latestAttempt: RunnerRunLog | null;
};

export type RunnerDashboardData = {
  levels: RunnerDashboardLevel[];
  logs: RunnerRunLog[];
  currentLevel: RunnerDashboardLevel | null;
  nextLevel: RunnerDashboardLevel | null;
  passedLevelsCount: number;
  totalAttempts: number;
  bestPaceEver: number | null;
  longestNoStopDistance: number | null;
  completionPercent: number;
};
