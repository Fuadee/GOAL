'use server';

import { revalidatePath } from 'next/cache';

import { addInnovationLog, addInnovationProcessStep, updateInnovationStepStatus } from '@/lib/innovation/service';
import {
  INNOVATION_LOG_TYPES,
  INNOVATION_STEP_STATUS,
  InnovationLogType,
  InnovationStepStatus
} from '@/lib/innovation/types';

function isInnovationLogType(value: string): value is InnovationLogType {
  return INNOVATION_LOG_TYPES.includes(value as InnovationLogType);
}

function isInnovationStepStatus(value: string): value is InnovationStepStatus {
  return INNOVATION_STEP_STATUS.includes(value as InnovationStepStatus);
}

export async function createInnovationProcessStepAction(
  innovationId: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!title) {
    return { success: false, message: 'Step title is required.' };
  }

  const stepOrderRaw = String(formData.get('step_order') ?? '').trim();
  const stepOrder = stepOrderRaw ? Number(stepOrderRaw) : undefined;

  await addInnovationProcessStep({
    innovation_id: innovationId,
    title,
    description: description || undefined,
    step_order: Number.isFinite(stepOrder) ? stepOrder : undefined
  });

  revalidatePath('/innovation');
  revalidatePath(`/innovation/${innovationId}`);

  return { success: true, message: 'Process step added.' };
}

export async function updateInnovationProcessStepStatusAction(
  innovationId: string,
  stepId: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const statusRaw = String(formData.get('status') ?? '').trim();

  if (!isInnovationStepStatus(statusRaw)) {
    return { success: false, message: 'Invalid process step status.' };
  }

  await updateInnovationStepStatus(stepId, innovationId, {
    status: statusRaw,
    completed_at: statusRaw === 'done' ? new Date().toISOString() : null
  });

  revalidatePath('/innovation');
  revalidatePath(`/innovation/${innovationId}`);

  return { success: true, message: 'Process step updated.' };
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

  revalidatePath('/innovation');
  revalidatePath(`/innovation/${innovationId}`);
  return { success: true, message: 'Log recorded.' };
}
