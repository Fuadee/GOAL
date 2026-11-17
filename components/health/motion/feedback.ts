import { activityType, hasValidMeasurement } from '@/lib/running/achievements';
import type { RunnerDashboardData, RunnerRunLog } from '@/lib/running/quest.types';

/** Presentation snapshots only. Achievement rules and persistence remain in lib/running. */
export type SaveReceipt = {
  kind: 'create' | 'edit'; id?: string;
  expected: Pick<RunnerRunLog, 'run_date' | 'distance_km' | 'duration_seconds' | 'activity_type'>;
};
export type Feedback = { key: number; kind: 'achievement' | 'record' | 'saved' | 'updated'; levels: number[]; records: string[]; runId: string };
export function personalRecords(logs: RunnerRunLog[]) {
  const measured = logs.filter(log => hasValidMeasurement(log) && activityType(log) !== 'walk');
  const byDistance = [...measured].sort((a, b) => b.distance_km - a.distance_km);
  const pace = measured.filter(log => log.duration_source !== 'legacy_pace').sort((a, b) => a.pace_seconds_per_km - b.pace_seconds_per_km)[0] ?? null;
  const five = measured.filter(log => activityType(log) === 'continuous' && log.distance_km === 5 && log.duration_source !== 'legacy_pace').sort((a, b) => a.duration_seconds - b.duration_seconds)[0] ?? null;
  return { distance: byDistance[0] ?? null, pace, continuous: byDistance.find(log => activityType(log) === 'continuous') ?? null, five };
}
export function snapshot(data: RunnerDashboardData) {
  return {
    passed: data.levels.filter(level => level.progress?.status === 'passed').map(level => level.level_number),
    logs: data.logs.map(log => ({ ...log })), best: personalRecords(data.logs)
  };
}
export type RunSnapshot = ReturnType<typeof snapshot>;
const changed = (before: RunnerRunLog, after: RunnerRunLog) => JSON.stringify(before) !== JSON.stringify(after);

/** Returns nothing until the acknowledged mutation can be seen in refreshed server data. */
export function confirmedFeedback(before: RunSnapshot, after: RunnerDashboardData, receipt: SaveReceipt, key: number): Feedback | null {
  const actual = after.logs.find(log => {
    const old = before.logs.find(row => row.id === log.id);
    const target = receipt.kind === 'create' ? !old : log.id === receipt.id && old && changed(old, log);
    return target && log.run_date === receipt.expected.run_date && log.distance_km === receipt.expected.distance_km &&
      log.duration_seconds === receipt.expected.duration_seconds && activityType(log) === receipt.expected.activity_type;
  });
  if (!actual) return null;
  if (receipt.kind === 'edit') return { key, kind: 'updated', levels: [], records: [], runId: actual.id };
  const levels = after.levels.filter(level => level.progress?.status === 'passed' && !before.passed.includes(level.level_number)).map(level => level.level_number);
  const best = personalRecords(after.logs);
  const records: string[] = [];
  // Only this confirmed run may earn a PB; unrelated refreshes cannot trigger an award.
  if (best.distance?.id === actual.id && (!before.best.distance || best.distance.distance_km > before.best.distance.distance_km)) records.push('ระยะทางสูงสุด');
  if (best.continuous?.id === actual.id && (!before.best.continuous || best.continuous.distance_km > before.best.continuous.distance_km)) records.push('วิ่งต่อเนื่องไกลที่สุด');
  if (best.pace?.id === actual.id && (!before.best.pace || best.pace.pace_seconds_per_km < before.best.pace.pace_seconds_per_km)) records.push('Pace ดีที่สุด');
  if (best.five?.id === actual.id && (!before.best.five || best.five.duration_seconds < before.best.five.duration_seconds)) records.push('เวลา 5K ดีที่สุด');
  return { key, kind: levels.length ? 'achievement' : records.length ? 'record' : 'saved', levels, records, runId: actual.id };
}
