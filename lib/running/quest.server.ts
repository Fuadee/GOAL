import { supabaseRestRequest } from '@/lib/supabase/rest';
import {
  buildDashboardLevels,
  calculatePaceSecondsPerKm,
  evaluateRunAttempt,
  getBestAttemptByLevel,
  getCurrentAvailableLevel,
  getTodayRunStatus
} from '@/lib/running/quest';
import {
  RunAttemptInput,
  RunnerDashboardData,
  RunnerLevel,
  RunnerLevelProgress,
  RunnerRestDay,
  RunnerRunLog
} from '@/lib/running/quest.types';

type RunnerLevelRow = Omit<RunnerLevel, 'distance_target_km'> & { distance_target_km: string | number };
type RunnerLevelProgressRow =
  Omit<RunnerLevelProgress, 'best_distance_km' | 'best_no_stop_distance_km'> & {
    best_distance_km: string | number | null;
    best_no_stop_distance_km: string | number | null;
  };
type RunnerRunLogRow = Omit<RunnerRunLog, 'distance_km' | 'level' | 'note' | 'effort'> & {
  distance_km: string | number;
  note: string | null;
  effort: 'easy' | 'normal' | 'hard' | null;
  level?: { id: string; level_number: number; title: string };
};
type RunnerRestDayRow = RunnerRestDay;

const toNumber = (value: string | number | null): number | null => {
  if (value === null) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const mapLevel = (row: RunnerLevelRow): RunnerLevel => ({
  ...row,
  distance_target_km: toNumber(row.distance_target_km) ?? 0
});

const mapProgress = (row: RunnerLevelProgressRow): RunnerLevelProgress => ({
  ...row,
  best_distance_km: toNumber(row.best_distance_km),
  best_no_stop_distance_km: toNumber(row.best_no_stop_distance_km)
});

const mapLog = (row: RunnerRunLogRow): RunnerRunLog => ({
  ...row,
  distance_km: toNumber(row.distance_km) ?? 0,
  level: row.level
});

const todayDate = () => new Date().toISOString().slice(0, 10);

export async function getRunnerLevels(): Promise<RunnerLevel[]> {
  const rows = await supabaseRestRequest<RunnerLevelRow[]>('runner_levels?order=sort_order.asc', 'GET');
  return rows.map(mapLevel);
}

export async function getRunnerProgress(): Promise<RunnerLevelProgress[]> {
  const rows = await supabaseRestRequest<RunnerLevelProgressRow[]>('runner_level_progress?order=updated_at.asc', 'GET');
  return rows.map(mapProgress);
}

export async function getRunnerRunLogs(limit = 50): Promise<RunnerRunLog[]> {
  const rows = await supabaseRestRequest<RunnerRunLogRow[]>(
    `runner_run_logs?select=*,level:runner_levels(id,level_number,title)&order=run_date.desc,created_at.desc&limit=${limit}`,
    'GET'
  );

  return rows.map(mapLog);
}

export async function getRunnerRestDays(limit = 30): Promise<RunnerRestDay[]> {
  return supabaseRestRequest<RunnerRestDayRow[]>(`runner_rest_days?order=rest_date.desc,created_at.desc&limit=${limit}`, 'GET');
}

export async function getRunnerDashboardData(): Promise<RunnerDashboardData> {
  const [levels, progress, logs, restDays] = await Promise.all([
    getRunnerLevels(),
    getRunnerProgress(),
    getRunnerRunLogs(100),
    getRunnerRestDays(30)
  ]);

  const dashboardLevels = buildDashboardLevels(levels, progress, logs);
  const currentLevel = dashboardLevels.find((level) => level.progress?.status === 'available') ?? null;
  const passedLevelsCount = dashboardLevels.filter((level) => level.progress?.status === 'passed').length;
  const nextLevel = currentLevel
    ? dashboardLevels.find((level) => level.sort_order === currentLevel.sort_order + 1) ?? null
    : null;

  const bestPaceEver = logs.length > 0 ? Math.min(...logs.map((log) => log.pace_seconds_per_km)) : null;
  const longestNoStopDistance = logs.length > 0 ? Math.max(...logs.filter((log) => log.no_stop).map((log) => log.distance_km), 0) : null;

  const todayStatus = getTodayRunStatus(logs, restDays, todayDate());
  const todayLog = logs.find((log) => log.run_date === todayDate()) ?? null;

  return {
    levels: dashboardLevels,
    logs,
    currentLevel,
    nextLevel,
    todayStatus,
    todayLog,
    passedLevelsCount,
    totalAttempts: logs.length,
    bestPaceEver,
    longestNoStopDistance: longestNoStopDistance && longestNoStopDistance > 0 ? longestNoStopDistance : null,
    completionPercent: Math.round((passedLevelsCount / Math.max(levels.length, 1)) * 100)
  };
}

export async function markRunnerRestDay(restDate: string): Promise<void> {
  await supabaseRestRequest<RunnerRestDayRow[]>('runner_rest_days', 'POST', {
    rest_date: restDate,
    note: null
  });
}

export async function upsertLevelProgressAfterAttempt(params: {
  level: RunnerLevel;
  progress: RunnerLevelProgress | null;
  attempt: RunAttemptInput;
  passed: boolean;
}): Promise<void> {
  const { level, progress, attempt, passed } = params;

  const nextBestDistance = Math.max(progress?.best_distance_km ?? 0, attempt.distance_km);
  const nextBestPace =
    progress?.best_pace_seconds_per_km === null || progress?.best_pace_seconds_per_km === undefined
      ? attempt.pace_seconds_per_km
      : Math.min(progress.best_pace_seconds_per_km, attempt.pace_seconds_per_km);
  const nextNoStopDistance = attempt.no_stop
    ? Math.max(progress?.best_no_stop_distance_km ?? 0, attempt.distance_km)
    : progress?.best_no_stop_distance_km ?? null;

  await supabaseRestRequest<RunnerLevelProgressRow[]>(`runner_level_progress?level_id=eq.${level.id}`, 'PATCH', {
    best_distance_km: nextBestDistance,
    best_pace_seconds_per_km: nextBestPace,
    best_no_stop_distance_km: nextNoStopDistance,
    status: passed ? 'passed' : progress?.status ?? 'available',
    passed_at: passed ? new Date().toISOString() : progress?.passed_at ?? null
  });
}

export async function createRunLog(input: {
  run_date: string;
  distance_km: number;
  duration_seconds: number;
  no_stop: boolean;
  note?: string;
  effort?: 'easy' | 'normal' | 'hard';
}): Promise<{ success: boolean; message: string }> {
  const levels = await getRunnerLevels();
  const progress = await getRunnerProgress();
  const currentLevel = getCurrentAvailableLevel(levels, progress);

  if (!currentLevel) {
    return { success: false, message: 'All levels are already passed.' };
  }

  const pace = calculatePaceSecondsPerKm(input.duration_seconds, input.distance_km);
  if (!pace) {
    return { success: false, message: 'Invalid distance or duration. Pace could not be calculated.' };
  }

  const attempt: RunAttemptInput = {
    ...input,
    pace_seconds_per_km: pace
  };

  const evaluation = evaluateRunAttempt(currentLevel, attempt);

  await supabaseRestRequest<RunnerRunLogRow[]>('runner_run_logs', 'POST', {
    level_id: currentLevel.id,
    run_date: input.run_date,
    distance_km: input.distance_km,
    duration_seconds: input.duration_seconds,
    pace_seconds_per_km: pace,
    no_stop: input.no_stop,
    note: input.note || null,
    effort: input.effort || null,
    result: evaluation.result
  });

  const currentProgress = progress.find((item) => item.level_id === currentLevel.id) ?? null;
  await upsertLevelProgressAfterAttempt({
    level: currentLevel,
    progress: currentProgress,
    attempt,
    passed: evaluation.passed
  });

  if (evaluation.passed) {
    const currentIndex = levels.findIndex((level) => level.id === currentLevel.id);
    const nextLevel = currentIndex >= 0 ? levels[currentIndex + 1] : null;

    if (nextLevel) {
      await supabaseRestRequest<RunnerLevelProgressRow[]>(
        `runner_level_progress?level_id=eq.${nextLevel.id}&status=eq.locked`,
        'PATCH',
        {
          status: 'available'
        }
      );
    }

    return { success: true, message: `Success. ${currentLevel.title} cleared.` };
  }

  const bestAttempt = getBestAttemptByLevel(await getRunnerRunLogs(100), currentLevel.id);
  if (bestAttempt?.result === 'passed') {
    return { success: true, message: `${currentLevel.title} was already passed on a previous attempt.` };
  }

  return { success: true, message: 'Attempt saved. Keep pushing on this level.' };
}
