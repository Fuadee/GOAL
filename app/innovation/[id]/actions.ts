'use server';

import { revalidatePath } from 'next/cache';

import { addInnovationLog, updateInnovationProgressAndStatus } from '@/lib/innovation/service';
import { INNOVATION_LOG_TYPES, INNOVATION_STATUS, InnovationLogType, InnovationStatus } from '@/lib/innovation/types';

function isInnovationStatus(value: string): value is InnovationStatus {
  return INNOVATION_STATUS.includes(value as InnovationStatus);
}

function isInnovationLogType(value: string): value is InnovationLogType {
  return INNOVATION_LOG_TYPES.includes(value as InnovationLogType);
}

export async function createInnovationLogAction(
  innovationId: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const title = String(formData.get('title') ?? '').trim();
  const logTypeRaw = String(formData.get('log_type') ?? '').trim();

  if (!title) {
    return { success: false, message: 'Log title is required.' };
  }

  if (!isInnovationLogType(logTypeRaw)) {
    return { success: false, message: 'Invalid log type.' };
  }

  await addInnovationLog({
    innovation_id: innovationId,
    title,
    log_type: logTypeRaw,
    detail: String(formData.get('detail') ?? '').trim() || undefined,
    problem: String(formData.get('problem') ?? '').trim() || undefined,
    solution: String(formData.get('solution') ?? '').trim() || undefined,
    result: String(formData.get('result') ?? '').trim() || undefined,
    lesson_learned: String(formData.get('lesson_learned') ?? '').trim() || undefined,
    next_step: String(formData.get('next_step') ?? '').trim() || undefined
  });

  const progressRaw = String(formData.get('progress_percent') ?? '').trim();
  const statusRaw = String(formData.get('status') ?? '').trim();

  if (progressRaw || statusRaw) {
    const patch: { progress_percent?: number; status?: InnovationStatus; completed_at?: string | null; started_at?: string | null } = {};

    if (progressRaw) {
      const progress = Number(progressRaw);
      if (!Number.isNaN(progress)) {
        patch.progress_percent = Math.max(0, Math.min(100, Math.round(progress)));
      }
    }

    if (statusRaw && isInnovationStatus(statusRaw)) {
      patch.status = statusRaw;
      if (statusRaw === 'completed') {
        patch.completed_at = new Date().toISOString();
      }
      if (statusRaw === 'building') {
        patch.started_at = new Date().toISOString();
      }
    }

    if (Object.keys(patch).length > 0) {
      await updateInnovationProgressAndStatus(innovationId, patch);
    }
  }

  revalidatePath('/innovation');
  revalidatePath(`/innovation/${innovationId}`);
  return { success: true, message: 'Log recorded.' };
}
