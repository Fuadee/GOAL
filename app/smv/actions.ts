'use server';

import { revalidatePath } from 'next/cache';

import { createChecklistLogAndApplyScore, manuallyAdjustDimensionScore } from '@/lib/smv/service';

export async function completeSmvChecklistItemAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const dimensionId = String(formData.get('dimension_id') ?? '').trim();
  const checklistItemId = String(formData.get('checklist_item_id') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();

  if (!dimensionId || !checklistItemId) {
    return { success: false, message: 'Dimension and checklist item are required.' };
  }

  try {
    await createChecklistLogAndApplyScore({
      dimensionId,
      checklistItemId,
      notes: notes || undefined
    });

    revalidatePath('/smv');
    return { success: true, message: 'Checklist completed and score updated.' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to complete checklist item.'
    };
  }
}

export async function manuallyAdjustSmvScoreAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const dimensionId = String(formData.get('dimension_id') ?? '').trim();
  const newScoreRaw = String(formData.get('new_score') ?? '').trim();
  const reason = String(formData.get('reason') ?? '').trim();

  const newScore = Number(newScoreRaw);

  if (!dimensionId) {
    return { success: false, message: 'Dimension is required.' };
  }

  if (!Number.isFinite(newScore)) {
    return { success: false, message: 'Score must be a number from 0 to 100.' };
  }

  if (!reason) {
    return { success: false, message: 'Reason is required for manual score adjustment.' };
  }

  try {
    await manuallyAdjustDimensionScore({
      dimensionId,
      newScore,
      reason
    });

    revalidatePath('/smv');
    return { success: true, message: 'Score adjusted successfully.' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to adjust score.'
    };
  }
}
