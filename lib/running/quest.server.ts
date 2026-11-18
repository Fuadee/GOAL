import { supabaseRestRequest } from '@/lib/supabase/rest';
import { evaluateRunAttempt, getTodayRunStatus } from './quest';
import { activityType, bangkokToday, computeAchievements, hasValidMeasurement, normalizeRunLog, validateRunInput } from './achievements';
import type { RunLogInput, RunnerDashboardData, RunnerLevel, RunnerLevelProgress, RunnerRestDay, RunnerRunLog } from './quest.types';

export async function getRunnerLevels(): Promise<RunnerLevel[]> {
  const rows = await supabaseRestRequest<RunnerLevel[]>('runner_levels?select=*&order=sort_order.asc', 'GET', undefined, { revalidate: false });
  return rows.map(row => ({ ...row, distance_target_km: Number(row.distance_target_km) }));
}

export async function getRunnerProgress(): Promise<RunnerLevelProgress[]> {
  return supabaseRestRequest('runner_level_progress?select=*&order=updated_at.asc', 'GET', undefined, { revalidate: false });
}

export async function getRunnerRunLogs(): Promise<RunnerRunLog[]> {
  // Read every page, including when the server caps responses below the requested size.
  const logs: RunnerRunLog[] = [];
  let offset = 0;
  for (;;) {
    const page = await supabaseRestRequest<RunnerRunLog[]>(`runner_run_logs?select=*&order=run_date.desc,created_at.desc,id.desc&limit=500&offset=${offset}`, 'GET', undefined, { revalidate: false });
    if (!page.length) break;
    logs.push(...page.filter(row => !row.deleted_at).map(normalizeRunLog));
    offset += page.length;
  }
  return logs;
}

export async function getRunnerRestDays(limit = 30): Promise<RunnerRestDay[]> {
  return supabaseRestRequest(`runner_rest_days?select=*&order=rest_date.desc&limit=${limit}`, 'GET', undefined, { revalidate: false });
}

export async function runningStorageReady(): Promise<boolean> {
  try {
    await supabaseRestRequest('runner_run_logs?select=activity_type,deleted_at,updated_at&limit=1', 'GET', undefined, { revalidate: false });
    return true;
  } catch (error) {
    if (error instanceof Error && /42703|PGRST204|does not exist|schema cache/i.test(error.message)) return false;
    throw error;
  }
}

function canCreateRun() {
  return process.env.GOAL_HEALTH_WRITES_ENABLED === 'true'
    || (process.env.VERCEL_ENV === 'production' && process.env.GOAL_HEALTH_PUBLIC_LOGGING !== 'false');
}

export async function getRunnerDashboardData(): Promise<RunnerDashboardData> {
  const [storedLevels, progress, logs, restDays, storageReady] = await Promise.all([
    getRunnerLevels(), getRunnerProgress(), getRunnerRunLogs(), getRunnerRestDays(), runningStorageReady()
  ]);
  const levels = computeAchievements(logs, storedLevels, progress);
  const currentLevel = levels.find(level => level.progress?.status === 'available') ?? null;
  const passedLevelsCount = levels.filter(level => level.progress?.status === 'passed').length;
  const measured = logs.filter(log => hasValidMeasurement(log) && activityType(log) !== 'walk');
  const continuous = measured.filter(log => activityType(log) === 'continuous');
  return { levels, logs, currentLevel, nextLevel: currentLevel ? levels.find(level => level.level_number === currentLevel.level_number + 1) ?? null : null,
    todayStatus: getTodayRunStatus(logs, restDays, bangkokToday()), todayLog: logs.find(log => log.run_date === bangkokToday()) ?? null,
    passedLevelsCount, totalAttempts: logs.length,
    bestPaceEver: measured.length ? Math.min(...measured.map(log => log.pace_seconds_per_km)) : null,
    longestNoStopDistance: continuous.length ? Math.max(...continuous.map(log => log.distance_km)) : null,
    completionPercent: passedLevelsCount * 10,
    storageReady,
    canCreateRun: storageReady && canCreateRun(),
    writesEnabled: storageReady && process.env.GOAL_HEALTH_WRITES_ENABLED === 'true' };
}

function assertWritesEnabled() {
  // This repository uses a service-role connection without per-user auth. Explicit opt-in
  // protects an existing production .env.local during local development and preview.
  if (process.env.GOAL_HEALTH_WRITES_ENABLED !== 'true') throw new Error('ขณะนี้เปิดดูได้อย่างเดียว ยังไม่ได้เปิดการบันทึกข้อมูล');
}

export async function saveRunLog(input: RunLogInput, edit?: { id: string; updated_at: string }) {
  if (edit || !canCreateRun()) assertWritesEnabled();
  const error = validateRunInput(input);
  if (error) return { success: false, message: error };
  if (!await runningStorageReady()) return { success: false, message: 'ยังไม่ได้เตรียมฐานข้อมูลสำหรับระบบ 10 Levels' };
  const data = await getRunnerDashboardData();
  const target = data.currentLevel ?? data.levels[9];
  const noStop = input.activity_type === 'continuous';
  const pace = input.duration_seconds / input.distance_km;
  const evaluation = evaluateRunAttempt(target, { ...input, no_stop: noStop, pace_seconds_per_km: pace });
  const body = { ...input, no_stop: noStop, note: input.note || null, effort: input.effort || null,
    // Legacy column is integer. Evaluation ALWAYS uses elapsed_seconds / distance.
    pace_seconds_per_km: Math.round(pace), result: evaluation.result };
  let result: RunnerRunLog[];
  if (edit) {
    if (!validLogId(edit.id) || !edit.updated_at) return { success: false, message: 'รายการแก้ไขไม่ถูกต้อง' };
    result = await supabaseRestRequest(`runner_run_logs?id=eq.${edit.id}&deleted_at=is.null&updated_at=eq.${encodeURIComponent(edit.updated_at)}`, 'PATCH', body);
  } else {
    result = await supabaseRestRequest('runner_run_logs', 'POST', { ...body, level_id: target.id });
  }
  return result.length ? { success: true, message: 'บันทึกแล้ว · ประเมินทั้ง 10 Levels จากประวัติทั้งหมดใหม่แล้ว' } : { success: false, message: 'ข้อมูลถูกแก้ไขจากหน้าต่างอื่น กรุณาโหลดหน้าใหม่' };
}

export const createRunLog = saveRunLog;
export const validLogId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function deleteRunLog(id: string, updatedAt: string) {
  assertWritesEnabled();
  if (!validLogId(id) || !updatedAt) return { success: false, message: 'รายการไม่ถูกต้อง' };
  const rows = await supabaseRestRequest<RunnerRunLog[]>(`runner_run_logs?id=eq.${id}&deleted_at=is.null&updated_at=eq.${encodeURIComponent(updatedAt)}`, 'PATCH', { deleted_at: new Date().toISOString() });
  return rows.length ? { success: true, message: 'นำรายการออกจากประวัติแล้ว และคำนวณระดับใหม่ (ยังเก็บข้อมูลต้นฉบับไว้)' } : { success: false, message: 'ข้อมูลเปลี่ยนแปลงแล้ว กรุณาโหลดหน้าใหม่' };
}

export async function markRunnerRestDay(restDate: string): Promise<void> {
  assertWritesEnabled();
  await supabaseRestRequest('runner_rest_days', 'POST', { rest_date: restDate, note: null });
}
