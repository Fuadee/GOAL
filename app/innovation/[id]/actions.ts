'use server';

import { revalidatePath } from 'next/cache';

import { addInnovationApp, addInnovationLog, addInnovationProcessStep, editInnovationApp, updateInnovationStepStatus } from '@/lib/innovation/service';
import { INNOVATION_APP_STATUS, INNOVATION_LOG_TYPES, INNOVATION_STEP_STATUS, InnovationAppStatus, InnovationLogType, InnovationStepStatus } from '@/lib/innovation/types';

function isInnovationLogType(value: string): value is InnovationLogType {
  return INNOVATION_LOG_TYPES.includes(value as InnovationLogType);
}

function isStepStatus(value: string): value is InnovationStepStatus {
  return INNOVATION_STEP_STATUS.includes(value as InnovationStepStatus);
}

function isInnovationAppStatus(value: string): value is InnovationAppStatus {
  return INNOVATION_APP_STATUS.includes(value as InnovationAppStatus);
}

function revalidateInnovationPages(innovationId: string) {
  revalidatePath('/innovation');
  revalidatePath(`/innovation/${innovationId}`);
}

export async function createInnovationProcessStepAction(innovationId: string, formData: FormData): Promise<{ success: boolean; message: string }> {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const statusRaw = String(formData.get('status') ?? 'todo').trim();
  const note = String(formData.get('note') ?? '').trim();

  if (!title) return { success: false, message: 'Step title is required.' };
  if (!isStepStatus(statusRaw)) return { success: false, message: 'Invalid step status.' };

  const stepOrderRaw = String(formData.get('step_order') ?? '').trim();
  const stepOrder = stepOrderRaw ? Number(stepOrderRaw) : undefined;

  await addInnovationProcessStep({ innovation_id: innovationId, title, description: description || undefined, step_order: Number.isFinite(stepOrder) ? stepOrder : undefined, status: statusRaw, note: note || undefined });
  revalidateInnovationPages(innovationId);
  return { success: true, message: 'Process step added.' };
}

export async function updateStepStatusAction(innovationId: string, stepId: string, status: InnovationStepStatus, note?: string): Promise<{ success: boolean; message: string }> {
  await updateInnovationStepStatus(stepId, innovationId, {
    status,
    note: note?.trim() || null,
    completed_at: status === 'completed' ? new Date().toISOString() : null
  });

  const shouldLog = ['in_progress', 'completed', 'blocked', 'waiting', 'todo'].includes(status);
  if (shouldLog) {
    await addInnovationLog({
      innovation_id: innovationId,
      log_type: status === 'blocked' ? 'problem' : 'update',
      title: `Step moved to ${status}`,
      detail: note?.trim() ? `Step moved to ${status}: ${note.trim()}` : `Step moved to ${status}`
    });
  }

  revalidateInnovationPages(innovationId);
  return { success: true, message: 'Step status updated.' };
}

export async function createInnovationLogAction(innovationId: string, formData: FormData): Promise<{ success: boolean; message: string }> {
  const title = String(formData.get('title') ?? '').trim();
  const logTypeRaw = String(formData.get('log_type') ?? '').trim();
  if (!title) return { success: false, message: 'Log title is required.' };
  if (!isInnovationLogType(logTypeRaw)) return { success: false, message: 'Invalid log type.' };

  await addInnovationLog({ innovation_id: innovationId, title, log_type: logTypeRaw, detail: String(formData.get('detail') ?? '').trim() || undefined, problem: String(formData.get('problem') ?? '').trim() || undefined, solution: String(formData.get('solution') ?? '').trim() || undefined, result: String(formData.get('result') ?? '').trim() || undefined, lesson_learned: String(formData.get('lesson_learned') ?? '').trim() || undefined, next_step: String(formData.get('next_step') ?? '').trim() || undefined });
  revalidateInnovationPages(innovationId);
  return { success: true, message: 'Log recorded.' };
}

export async function createInnovationAppAction(innovationId: string, formData: FormData): Promise<{ success: boolean; message: string }> {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const status = String(formData.get('status') ?? 'building').trim();

  if (!title) return { success: false, message: 'กรุณากรอกชื่อแอป' };
  if (!isInnovationAppStatus(status)) return { success: false, message: 'สถานะแอปไม่ถูกต้อง' };

  try {
    await addInnovationApp({ innovation_id: innovationId, title, description: description || undefined, status });
    revalidateInnovationPages(innovationId);
    return { success: true, message: 'เพิ่มแอปเรียบร้อยแล้ว' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'เพิ่มแอปไม่สำเร็จ' };
  }
}

export async function updateInnovationAppAction(innovationId: string, appId: string, formData: FormData): Promise<{ success: boolean; message: string }> {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();

  if (!appId || !title) return { success: false, message: 'กรุณากรอกชื่อแอป' };
  if (!isInnovationAppStatus(status)) return { success: false, message: 'สถานะแอปไม่ถูกต้อง' };

  try {
    await editInnovationApp(appId, innovationId, { title, description: description || null, status });
    revalidateInnovationPages(innovationId);
    return { success: true, message: 'อัปเดตแอปเรียบร้อยแล้ว' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'อัปเดตแอปไม่สำเร็จ' };
  }
}
