import type { RunLogInput, RunnerActivityType, RunnerDashboardLevel, RunnerLevel, RunnerLevelProgress, RunnerRunLog } from './quest.types';

/** Stable rules; database progress/result fields are legacy snapshots, never evidence. */
export const RUNNING_LEVELS: RunnerLevel[] = [1, 2, 2.5, 3, 4, 5, 5, 5, 5, 5].map((distance, index) => ({
  id: `road-to-5k-${index + 1}`, level_number: index + 1, sort_order: index + 1,
  title: ['First kilometre', 'Find your rhythm', 'Halfway there', 'Build your base', 'Go the distance', 'Reach 5K', 'Run it all', 'Find your pace', 'Pick up speed', '5K achieved'][index],
  distance_target_km: distance, pace_target_seconds_per_km: index >= 7 ? [600, 540, 480][index - 7] : null,
  created_at: ''
}));

export const ACTIVITY_LABELS: Record<RunnerActivityType, string> = {
  continuous: 'วิ่งต่อเนื่อง', run_walk: 'วิ่งสลับเดิน', walk: 'เดินล้วน', unknown: 'ไม่ทราบรูปแบบ'
};

export function activityType(log: { activity_type?: RunnerActivityType; no_stop: boolean | null }): RunnerActivityType {
  if (log.activity_type && log.activity_type !== 'unknown') return log.activity_type;
  // The old unchecked checkbox is NOT proof of run/walk. Only explicit true is evidence.
  return log.no_stop === true ? 'continuous' : 'unknown';
}

export function bangkokToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export function validateRunDuration(seconds: number, distanceKm: number): string | null {
  if (!Number.isSafeInteger(seconds) || seconds <= 0 || seconds > 604800) return 'เวลารวมต้องเป็นจำนวนวินาที มากกว่า 0 และไม่เกิน 7 วัน';
  if (distanceKm > 0 && seconds / distanceKm < 60) return 'Pace เร็วกว่า 1:00 /กม. โปรดตรวจระยะทางและเวลารวม';
  return null;
}

export function validateRunInput(input: RunLogInput, today = bangkokToday()): string | null {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(input.run_date) ? new Date(`${input.run_date}T00:00:00Z`) : null;
  if (!date || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== input.run_date || input.run_date < '1900-01-01' || input.run_date > today) return 'กรุณาระบุวันที่จริง ไม่เกินวันนี้';
  if (!Number.isFinite(input.distance_km) || input.distance_km < 0.01 || input.distance_km > 1000) return 'ระยะทางต้องอยู่ระหว่าง 0.01–1,000 กม.';
  const durationError = validateRunDuration(input.duration_seconds, input.distance_km);
  if (durationError) return durationError;
  if (!Object.hasOwn(ACTIVITY_LABELS, input.activity_type)) return 'กรุณาเลือกรูปแบบกิจกรรม';
  if (input.note && input.note.length > 2000) return 'หมายเหตุต้องไม่เกิน 2,000 ตัวอักษร';
  if (input.effort && !['easy', 'normal', 'hard'].includes(input.effort)) return 'ความหนักไม่ถูกต้อง';
  return null;
}

type Evidence = Pick<RunnerRunLog, 'distance_km' | 'duration_seconds' | 'no_stop' | 'activity_type' | 'deleted_at' | 'duration_source'>;

export function hasValidMeasurement(log: Pick<Evidence, 'distance_km' | 'duration_seconds' | 'deleted_at'>) {
  return !log.deleted_at && Number.isFinite(log.distance_km) && log.distance_km > 0 && Number.isSafeInteger(log.duration_seconds) && log.duration_seconds > 0;
}

export function qualifiesForLevel(level: RunnerLevel, log: Evidence): boolean {
  if (!hasValidMeasurement(log) || log.distance_km < level.distance_target_km) return false;
  const activity = activityType(log);
  if (level.level_number === 6 ? !['continuous', 'run_walk'].includes(activity) : activity !== 'continuous') return false;
  // Compare the unrounded ratio. 40:01 / 5 must not round down to 8:00 and pass.
  return level.pace_target_seconds_per_km === null || (log.duration_source !== 'legacy_pace' && log.duration_seconds / log.distance_km <= level.pace_target_seconds_per_km);
}

export function normalizeRunLog(row: RunnerRunLog): RunnerRunLog {
  const distance = Number(row.distance_km);
  const recorded = Number(row.duration_seconds);
  const duration = recorded > 0 ? recorded : Math.round(Number(row.pace_seconds_per_km) * distance);
  return { ...row, distance_km: distance, duration_seconds: duration,
    duration_source: recorded > 0 ? 'recorded' : 'legacy_pace',
    pace_seconds_per_km: duration > 0 && distance > 0 ? duration / distance : NaN,
    activity_type: activityType(row) };
}

export function computeAchievements(logs: RunnerRunLog[], storedLevels: RunnerLevel[] = [], legacyProgress: RunnerLevelProgress[] = []): RunnerDashboardLevel[] {
  const history = [...logs].filter(log => !log.deleted_at).sort((a, b) => a.run_date.localeCompare(b.run_date) || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
  let blocked = false;
  return RUNNING_LEVELS.map(rule => {
    const stored = storedLevels.find(level => level.level_number === rule.level_number);
    const level = { ...rule, id: stored?.id ?? rule.id };
    const evidence = history.find(log => qualifiesForLevel(level, log)) ?? null;
    const status = blocked ? 'locked' : evidence ? 'passed' : 'available';
    if (!evidence) blocked = true;
    const old = legacyProgress.find(progress => progress.level_id === level.id);
    return { ...level, evidence, conditionMet: !!evidence, latestAttempt: history.at(-1) ?? null,
      progress: { ...old, id: old?.id ?? level.id, level_id: level.id, status,
        best_distance_km: old?.best_distance_km ?? null, best_pace_seconds_per_km: old?.best_pace_seconds_per_km ?? null,
        best_no_stop_distance_km: old?.best_no_stop_distance_km ?? null,
        passed_at: status === 'passed' ? evidence?.run_date ?? null : null, updated_at: old?.updated_at ?? '' } };
  });
}

export function levelRequirement(level: RunnerLevel): string {
  const activity = level.level_number === 6 ? 'วิ่งหรือวิ่งสลับเดิน' : 'วิ่งต่อเนื่อง';
  return `${activity} ≥ ${level.distance_target_km} กม. · ${level.pace_target_seconds_per_km === null ? 'ไม่จำกัด Pace' : `Pace ≤ ${level.pace_target_seconds_per_km / 60}:00 /กม.`}`;
}

export function unmetReason(level: RunnerLevel, log: RunnerRunLog | null): string {
  if (!log) return 'ยังไม่มีผลวิ่งสำหรับประเมิน';
  if (!hasValidMeasurement(log)) return 'ข้อมูลระยะทางหรือเวลาไม่ครบ';
  const reasons: string[] = [];
  if (log.distance_km < level.distance_target_km) reasons.push(`ขาดระยะ ${(level.distance_target_km - log.distance_km).toFixed(2)} กม.`);
  const activity = activityType(log);
  if (activity === 'unknown') reasons.push('ยังไม่ยืนยันรูปแบบการวิ่ง');
  else if (level.level_number === 6 ? activity === 'walk' : activity !== 'continuous') reasons.push(level.level_number === 6 ? 'เดินล้วนไม่นับผ่าน' : 'ยังต้องวิ่งต่อเนื่อง');
  if (level.pace_target_seconds_per_km !== null && (log.duration_source === 'legacy_pace' || log.duration_seconds / log.distance_km > level.pace_target_seconds_per_km)) reasons.push(log.duration_source === 'legacy_pace' ? 'ต้องยืนยันเวลารวมจริง' : 'Pace ยังไม่ถึงเป้า');
  return reasons.join(' · ') || 'ทำเงื่อนไขนี้ได้แล้ว';
}
