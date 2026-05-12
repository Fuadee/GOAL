'use server';

import { revalidatePath } from 'next/cache';

import { claimHealthMissionReward, createRunLog, deleteHealthMissionReward, markRunnerRestDay, upsertHealthMissionReward } from '@/lib/running/quest.server';
import { parseMinuteSecondDuration } from '@/lib/running/quest';

const isEffort = (value: string): value is 'easy' | 'normal' | 'hard' => {
  return value === 'easy' || value === 'normal' || value === 'hard';
};

export async function createRunnerRunLogAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const runDate = String(formData.get('run_date') ?? '').trim();
  const distanceRaw = String(formData.get('distance_km') ?? '').trim();
  const durationInputRaw = String(formData.get('duration_input') ?? '').trim();
  const noStopRaw = String(formData.get('no_stop') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();
  const effortRaw = String(formData.get('effort') ?? '').trim();

  const distance = Number(distanceRaw);
  const durationResult = parseMinuteSecondDuration(durationInputRaw);
  const durationSeconds = durationResult.durationSeconds;

  if (!runDate) {
    return { success: false, message: 'Run date is required.' };
  }

  if (!Number.isFinite(distance) || distance <= 0) {
    return { success: false, message: 'Distance must be greater than 0 km.' };
  }

  if (!durationSeconds || durationSeconds <= 0) {
    return { success: false, message: durationResult.error ?? 'Duration must be valid.' };
  }

  const noStop = noStopRaw === 'true';
  const effort = isEffort(effortRaw) ? effortRaw : undefined;

  const result = await createRunLog({
    run_date: runDate,
    distance_km: distance,
    duration_seconds: durationSeconds,
    no_stop: noStop,
    note: note || undefined,
    effort
  });

  revalidatePath('/health');
  return result;
}

export async function markRunnerRestDayAction(formData: FormData): Promise<void> {
  const restDate = String(formData.get('rest_date') ?? '').trim();

  if (!restDate) {
    throw new Error('Rest date is required.');
  }

  await markRunnerRestDay(restDate);
  revalidatePath('/health');
}

export async function upsertHealthRewardAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const levelId = String(formData.get('level_id') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const emotionalCopy = String(formData.get('emotional_copy') ?? '').trim();
  const imageUrl = String(formData.get('image_url') ?? '').trim();
  if (!levelId || !title || !description) return { success: false, message: 'กรอกข้อมูล reward ให้ครบ' };
  await upsertHealthMissionReward(levelId, { title, description, emotionalCopy, imageUrl });
  revalidatePath('/health');
  return { success: true, message: 'บันทึก reward แล้ว' };
}

export async function deleteHealthRewardAction(formData: FormData): Promise<void> {
  const levelId = String(formData.get('level_id') ?? '');
  if (!levelId) throw new Error('level_id required');
  await deleteHealthMissionReward(levelId);
  revalidatePath('/health');
}

export async function claimHealthRewardAction(formData: FormData): Promise<void> {
  const levelId = String(formData.get('level_id') ?? '');
  if (!levelId) throw new Error('level_id required');
  await claimHealthMissionReward(levelId);
  revalidatePath('/health');
}
