'use server';

import { revalidatePath } from 'next/cache';
import { deleteRunLog, markRunnerRestDay, saveRunLog } from '@/lib/running/quest.server';
import { parseMinuteSecondDuration } from '@/lib/running/quest';
import type { RunnerActivityType, RunnerEffort } from '@/lib/running/quest.types';

export async function createRunnerRunLogAction(form: FormData): Promise<{ success: boolean; message: string }> {
  const time = parseMinuteSecondDuration(String(form.get('duration_input') ?? ''));
  if (!time.durationSeconds) return { success: false, message: time.error ?? 'เวลารวมไม่ถูกต้อง' };
  const id = String(form.get('id') ?? '');
  const rawActivity = String(form.get('activity_type') ?? '');
  // Compatibility for the old form: unchecked never becomes run_walk automatically.
  const activity = rawActivity || (form.get('no_stop') === 'true' ? 'continuous' : 'unknown');
  try {
    const result = await saveRunLog({ run_date: String(form.get('run_date') ?? '').trim(), distance_km: Number(form.get('distance_km')),
      duration_seconds: time.durationSeconds, activity_type: activity as RunnerActivityType,
      note: String(form.get('note') ?? '').trim(), effort: (String(form.get('effort') ?? '') || undefined) as RunnerEffort | undefined
    }, id ? { id, updated_at: String(form.get('updated_at') ?? '') } : undefined);
    if (result.success) { revalidatePath('/health'); revalidatePath('/dashboard'); }
    return result;
  } catch (error) {
    if (error instanceof Error && /^Supabase request failed \((401|403)\)/.test(error.message)) {
      return { success: false, message: 'ฐานข้อมูลปฏิเสธการเขียน กรุณาให้ผู้ดูแลตรวจสิทธิ์ของเซิร์ฟเวอร์ แล้วลองอีกครั้ง' };
    }
    if (process.env.GOAL_HEALTH_WRITES_ENABLED !== 'true') {
      return { success: false, message: 'เซิร์ฟเวอร์ปิดการเขียนข้อมูล กรุณาให้ผู้ดูแลตรวจการตั้งค่าแล้วโหลดหน้าใหม่' };
    }
    return { success: false, message: 'บันทึกไม่สำเร็จ กรุณาตรวจการเชื่อมต่อและสิทธิ์การเขียน แล้วลองอีกครั้ง' };
  }
}

export async function deleteRunnerRunLogAction(id: string, updatedAt: string) {
  try {
    const result = await deleteRunLog(id, updatedAt);
    if (result.success) { revalidatePath('/health'); revalidatePath('/dashboard'); }
    return result;
  } catch {
    return { success: false, message: 'ลบไม่สำเร็จ ข้อมูลเดิมยังอยู่ กรุณาลองอีกครั้ง' };
  }
}

export async function markRunnerRestDayAction(formData: FormData): Promise<void> {
  const restDate = String(formData.get('rest_date') ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(restDate)) throw new Error('Rest date is required.');
  await markRunnerRestDay(restDate);
  revalidatePath('/health');
}
