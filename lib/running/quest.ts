import {
  RunAttemptEvaluation,
  RunAttemptInput,
  RunnerDashboardLevel,
  RunnerLevel,
  RunnerLevelProgress,
  RunnerRunLog,
  RunnerRunResult
} from '@/lib/running/quest.types';

export function formatPace(secondsPerKm: number | null): string {
  if (!secondsPerKm || secondsPerKm <= 0) {
    return '--:--';
  }

  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = secondsPerKm % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')} /km`;
}

export function formatDuration(durationSeconds: number | null): string {
  if (!durationSeconds || durationSeconds <= 0) {
    return '--:--';
  }

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function parseDurationToSeconds(input: string): number | null {
  const value = input.trim();
  if (!value) return null;

  if (/^\d+$/.test(value)) {
    const seconds = Number(value);
    return Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : null;
  }

  const parts = value.split(':').map((part) => part.trim());
  if (parts.some((part) => !/^\d+$/.test(part))) return null;

  if (parts.length === 2) {
    const [minutes, seconds] = parts.map(Number);
    if (seconds >= 60) return null;
    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts.map(Number);
    if (minutes >= 60 || seconds >= 60) return null;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return null;
}

export function calculatePaceSecondsPerKm(durationSeconds: number, distanceKm: number): number | null {
  if (!Number.isFinite(durationSeconds) || !Number.isFinite(distanceKm) || durationSeconds <= 0 || distanceKm <= 0) {
    return null;
  }

  return Math.round(durationSeconds / distanceKm);
}

export function evaluateRunAttempt(level: RunnerLevel, input: RunAttemptInput): RunAttemptEvaluation {
  const distanceMet = input.distance_km >= level.distance_target_km;
  const paceMet = input.pace_seconds_per_km <= level.pace_target_seconds_per_km;
  const noStopMet = input.no_stop;

  const unmetConditions: Array<'distance' | 'pace' | 'no_stop'> = [];

  if (!distanceMet) unmetConditions.push('distance');
  if (!paceMet) unmetConditions.push('pace');
  if (!noStopMet) unmetConditions.push('no_stop');

  const passed = unmetConditions.length === 0;

  let result: RunnerRunResult = 'passed';

  if (!passed) {
    if (unmetConditions.length > 1) {
      result = 'failed_multiple';
    } else if (unmetConditions[0] === 'distance') {
      result = 'failed_distance';
    } else if (unmetConditions[0] === 'pace') {
      result = 'failed_pace';
    } else {
      result = 'failed_stopped';
    }
  }

  return {
    result,
    passed,
    distanceRemainingKm: Math.max(level.distance_target_km - input.distance_km, 0),
    paceDeltaSeconds: Math.max(input.pace_seconds_per_km - level.pace_target_seconds_per_km, 0),
    unmetConditions
  };
}

export function getFailureReason(evaluation: RunAttemptEvaluation): string {
  if (evaluation.passed) {
    return 'Level cleared. Next challenge unlocked.';
  }

  const segments: string[] = [];

  if (evaluation.unmetConditions.includes('distance')) {
    segments.push(`Need ${evaluation.distanceRemainingKm.toFixed(2)} km more`);
  }

  if (evaluation.unmetConditions.includes('pace')) {
    const deltaMinutes = Math.floor(evaluation.paceDeltaSeconds / 60);
    const deltaSeconds = evaluation.paceDeltaSeconds % 60;
    segments.push(`Need to be faster by ${deltaMinutes}:${String(deltaSeconds).padStart(2, '0')} /km`);
  }

  if (evaluation.unmetConditions.includes('no_stop')) {
    segments.push('Run must be completed without stopping');
  }

  return segments.join(' • ');
}

export function getCurrentAvailableLevel(
  levels: RunnerLevel[],
  progress: RunnerLevelProgress[]
): RunnerLevel | null {
  const progressMap = new Map(progress.map((item) => [item.level_id, item]));

  return (
    levels.find((level) => progressMap.get(level.id)?.status === 'available') ??
    levels.find((level) => progressMap.get(level.id)?.status !== 'passed') ??
    null
  );
}

export function getBestAttemptByLevel(logs: RunnerRunLog[], levelId: string): RunnerRunLog | null {
  const levelLogs = logs.filter((log) => log.level_id === levelId);
  if (levelLogs.length === 0) return null;

  return [...levelLogs].sort((a, b) => {
    const rank = (result: RunnerRunResult) => (result === 'passed' ? 0 : 1);
    const resultDelta = rank(a.result) - rank(b.result);
    if (resultDelta !== 0) return resultDelta;

    if (a.distance_km !== b.distance_km) return b.distance_km - a.distance_km;
    return a.pace_seconds_per_km - b.pace_seconds_per_km;
  })[0];
}

export function buildDashboardLevels(
  levels: RunnerLevel[],
  progress: RunnerLevelProgress[],
  logs: RunnerRunLog[]
): RunnerDashboardLevel[] {
  const progressMap = new Map(progress.map((item) => [item.level_id, item]));

  return levels.map((level) => ({
    ...level,
    progress: progressMap.get(level.id) ?? null,
    latestAttempt: logs.find((log) => log.level_id === level.id) ?? null
  }));
}
