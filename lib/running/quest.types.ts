export type RunnerProgressStatus = 'locked' | 'available' | 'passed';

export type RunnerRunResult = 'passed' | 'failed_distance' | 'failed_pace' | 'failed_stopped' | 'failed_multiple';

export type RunnerEffort = 'easy' | 'normal' | 'hard';

export type RunnerTodayStatus = 'not_run' | 'ran' | 'rest';

export type RunnerLevel = {
  id: string;
  level_number: number;
  title: string;
  distance_target_km: number;
  pace_target_seconds_per_km: number | null;
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
  no_stop: boolean | null;
  activity_type?: RunnerActivityType;
  deleted_at?: string | null;
  updated_at?: string;
  duration_source?: 'recorded' | 'legacy_pace';
  note: string | null;
  effort: RunnerEffort | null;
  result: RunnerRunResult;
  created_at: string;
  level?: Pick<RunnerLevel, 'id' | 'level_number' | 'title'>;
};

export type RunnerRestDay = {
  id: string;
  rest_date: string;
  note: string | null;
  created_at: string;
};

export type RunnerLevelProgress = {
  id: string;
  level_id: string;
  status: RunnerProgressStatus;
  best_distance_km: number | null;
  best_pace_seconds_per_km: number | null;
  best_no_stop_distance_km: number | null;
  passed_at: string | null;
  reward_title?: string | null;
  reward_description?: string | null;
  reward_emotional_copy?: string | null;
  reward_image_url?: string | null;
  reward_status?: 'locked' | 'unlocked' | 'claimed' | null;
  reward_claimed_at?: string | null;
  updated_at: string;
};

export type RunAttemptInput = {
  run_date: string;
  distance_km: number;
  duration_seconds: number;
  pace_seconds_per_km: number;
  no_stop: boolean | null;
  activity_type?: RunnerActivityType;
  duration_source?: 'recorded' | 'legacy_pace';
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
  evidence?: RunnerRunLog | null;
  conditionMet?: boolean;
};

export type RunnerDashboardData = {
  levels: RunnerDashboardLevel[];
  logs: RunnerRunLog[];
  currentLevel: RunnerDashboardLevel | null;
  nextLevel: RunnerDashboardLevel | null;
  todayStatus: RunnerTodayStatus;
  todayLog: RunnerRunLog | null;
  passedLevelsCount: number;
  totalAttempts: number;
  bestPaceEver: number | null;
  longestNoStopDistance: number | null;
  completionPercent: number;
  writesEnabled?: boolean;
  canCreateRun?: boolean;
  storageReady?: boolean;
};

export type RunnerActivityType = 'continuous' | 'run_walk' | 'walk' | 'unknown';

export type RunLogInput = {
  run_date: string;
  distance_km: number;
  duration_seconds: number;
  activity_type: RunnerActivityType;
  note?: string;
  effort?: RunnerEffort;
};
