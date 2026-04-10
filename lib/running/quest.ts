import {
  RunAttemptEvaluation,
  RunAttemptInput,
  RunnerDashboardLevel,
  RunnerLevel,
  RunnerLevelProgress,
  RunnerRestDay,
  RunnerRunLog,
  RunnerRunResult,
  RunnerTodayStatus
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

export function parseMinuteSecondDuration(input: string): {
  durationSeconds: number | null;
  error: string | null;
  displayValue: string | null;
} {
  const value = input.trim();

  if (!value) {
    return { durationSeconds: null, error: 'กรุณากรอกระยะเวลา', displayValue: null };
  }

  if (value.includes(':')) {
    const parsed = parseDurationToSeconds(value);
    if (!parsed || parsed <= 0) {
      return { durationSeconds: null, error: 'รูปแบบเวลาไม่ถูกต้อง', displayValue: null };
    }

    return {
      durationSeconds: parsed,
      error: null,
      displayValue: formatDuration(parsed)
    };
  }

  const numericValue = value.replace(/\D/g, '');
  if (!numericValue) {
    return { durationSeconds: null, error: 'กรุณากรอกตัวเลขเวลา', displayValue: null };
  }

  const minutesPart = numericValue.length > 2 ? numericValue.slice(0, -2) : '0';
  const secondsPart = numericValue.slice(-2);
  const minutes = Number(minutesPart);
  const seconds = Number(secondsPart);

  if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || minutes < 0 || seconds < 0 || seconds > 59) {
    return { durationSeconds: null, error: 'วินาทีต้องอยู่ระหว่าง 00-59', displayValue: null };
  }

  const durationSeconds = minutes * 60 + seconds;
  if (durationSeconds <= 0) {
    return { durationSeconds: null, error: 'เวลาต้องมากกว่า 0 วินาที', displayValue: null };
  }

  return {
    durationSeconds,
    error: null,
    displayValue: `${minutes}:${String(seconds).padStart(2, '0')}`
  };
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

export function getTodayRunStatus(logs: RunnerRunLog[], restDays: RunnerRestDay[], todayDate: string): RunnerTodayStatus {
  const hasRunToday = logs.some((log) => log.run_date === todayDate);
  if (hasRunToday) return 'ran';

  const isRestDay = restDays.some((day) => day.rest_date === todayDate);
  if (isRestDay) return 'rest';

  return 'not_run';
}

export function getPrimaryHealthAction(todayStatus: RunnerTodayStatus): string {
  if (todayStatus === 'ran') return 'บันทึกผลการวิ่งวันนี้';
  if (todayStatus === 'rest') return 'วันนี้เน้นฟื้นฟูร่างกาย';
  return 'เริ่มภารกิจวันนี้';
}

export function getNextMissionText(currentLevel: RunnerDashboardLevel | null, latestAttempt: RunnerRunLog | null, todayStatus: RunnerTodayStatus): string {
  if (todayStatus === 'ran') {
    return 'ถ้าวิ่งแล้ว ให้บันทึกผลทันทีเพื่ออัปเดตด่าน';
  }

  if (todayStatus === 'rest') {
    return 'วันนี้พักเพื่อฟื้นตัว แล้วกลับมาลุยด่านพรุ่งนี้';
  }

  if (!currentLevel) {
    return 'รักษาความสม่ำเสมอ วิ่งเบา ๆ เพื่อคงฟอร์ม';
  }

  if (latestAttempt && latestAttempt.pace_seconds_per_km > currentLevel.pace_target_seconds_per_km) {
    return `เป้าหมายของวันนี้คือทำ pace ให้ต่ำกว่า ${formatPace(currentLevel.pace_target_seconds_per_km).replace(' /km', '/km')}`;
  }

  return `วันนี้วิ่ง ${currentLevel.distance_target_km} km แบบไม่หยุดให้จบก่อน`;
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
