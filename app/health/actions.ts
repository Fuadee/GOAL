'use server';

import { revalidatePath } from 'next/cache';

import { createRunLog, markRunnerRestDay } from '@/lib/running/quest.server';
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
