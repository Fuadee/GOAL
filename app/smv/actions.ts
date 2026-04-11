'use server';

import { revalidatePath } from 'next/cache';

import { addSocialEvidence, createEvidenceAndRecalculate, markConfidenceStagePassed, markSocialLevelCompleted, updateAppearanceLevel } from '@/lib/smv/service';
import { createSmvActionLog, getSmvDimensions, getSmvMetrics } from '@/lib/smv/repository';
import { APPEARANCE_CATEGORY_KEYS } from '@/lib/smv/appearance-config';

export async function logSmvEvidenceAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const dimensionId = String(formData.get('dimension_id') ?? '').trim();
  const context = String(formData.get('context') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();

  if (!dimensionId) {
    return { success: false, message: 'Dimension is required.' };
  }

  const metrics = await getSmvMetrics(dimensionId);
  const metricValues = metrics
    .map((metric) => {
      const raw = formData.get(`metric_${metric.id}`);
      if (raw === null || String(raw).trim() === '') {
        return null;
      }

      const numeric = Number(raw);
      if (!Number.isFinite(numeric)) {
        return null;
      }

      return {
        metricId: metric.id,
        key: metric.key,
        valueType: metric.value_type,
        numericValue: numeric
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const dimensions = await getSmvDimensions();
  const selectedDimension = dimensions.find((dimension) => dimension.id === dimensionId);
  const isLookDimension = selectedDimension?.key === 'look';

  const appearanceCategoryRaw = String(formData.get('appearance_category') ?? '').trim();
  const targetLevelRaw = String(formData.get('target_level') ?? '').trim();
  const evidenceType = String(formData.get('evidence_type') ?? '').trim();

  if (!isLookDimension && metricValues.length === 0) {
    return { success: false, message: 'At least one metric value is required.' };
  }

  const appearanceCategory = APPEARANCE_CATEGORY_KEYS.includes(appearanceCategoryRaw as (typeof APPEARANCE_CATEGORY_KEYS)[number])
    ? (appearanceCategoryRaw as (typeof APPEARANCE_CATEGORY_KEYS)[number])
    : undefined;
  const targetLevel = targetLevelRaw ? Number(targetLevelRaw) : undefined;

  if (isLookDimension && !appearanceCategory) {
    return { success: false, message: 'กรุณาเลือกหมวด Appearance ก่อนบันทึกหลักฐาน' };
  }

  try {
    await createEvidenceAndRecalculate({
      dimensionId,
      context,
      note,
      appearanceCategory,
      targetLevel,
      evidenceType: evidenceType || undefined,
      metricValues
    });

    revalidatePath('/smv');
    revalidatePath('/smv/log');
    revalidatePath('/smv/plan');
    revalidatePath('/smv/appearance');
    revalidatePath('/smv/appearance/style');
    revalidatePath('/smv/appearance/body');
    revalidatePath('/smv/appearance/grooming');
    return { success: true, message: 'Evidence saved and score recalculated.' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Could not save evidence log.'
    };
  }
}

export async function markConfidenceStagePassedAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const stageKey = String(formData.get('stage_key') ?? '').trim();
  if (!stageKey) {
    return { success: false, message: 'ไม่พบด่านที่ต้องการยืนยัน' };
  }

  try {
    await markConfidenceStagePassed(stageKey);
    revalidatePath('/smv');
    revalidatePath('/smv/confidence');
    return { success: true, message: 'ยืนยันผ่านด่านเรียบร้อยแล้ว' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'ไม่สามารถอัปเดตด่านได้'
    };
  }
}

export async function saveStatusIncomeAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const monthlyIncomeRaw = String(formData.get('monthly_income') ?? '').trim();
  const referenceMonth = String(formData.get('reference_month') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();

  const monthlyIncome = Number(monthlyIncomeRaw);
  if (!Number.isFinite(monthlyIncome) || monthlyIncome < 0) {
    return { success: false, message: 'กรุณากรอกรายได้ต่อเดือนเป็นตัวเลขที่ถูกต้อง' };
  }

  try {
    const dimensions = await getSmvDimensions();
    const statusDimension = dimensions.find((dimension) => dimension.key === 'status');
    if (!statusDimension) {
      return { success: false, message: 'ไม่พบมิติ status ในระบบ' };
    }

    const metrics = await getSmvMetrics(statusDimension.id);
    const incomeMetric = metrics.find((metric) => metric.key === 'income_level');
    if (!incomeMetric) {
      return { success: false, message: 'ไม่พบ metric รายได้ (income_level)' };
    }

    const context = referenceMonth ? `อ้างอิงเดือน ${referenceMonth}` : 'อัปเดตรายได้ปัจจุบัน';

    await createEvidenceAndRecalculate({
      dimensionId: statusDimension.id,
      context,
      note,
      metricValues: [
        {
          metricId: incomeMetric.id,
          key: incomeMetric.key,
          valueType: incomeMetric.value_type,
          numericValue: monthlyIncome
        }
      ]
    });

    try {
      await createSmvActionLog({
        dimension: 'status',
        action_type: 'income_update',
        value_numeric: monthlyIncome,
        note: note || context
      });
    } catch {
      // If smv_logs schema differs or is not available, we still keep evidence logs as source of truth.
    }

    revalidatePath('/smv');
    revalidatePath('/smv/status');
    revalidatePath('/smv/log');
    return { success: true, message: 'บันทึกรายได้แล้ว ระบบคำนวณด่านใหม่เรียบร้อย' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'ไม่สามารถบันทึกรายได้ได้'
    };
  }
}


export async function updateAppearanceLevelAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const categoryKey = String(formData.get('category_key') ?? '').trim();
  const unlockedLevelRaw = String(formData.get('unlocked_level') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();

  if (!APPEARANCE_CATEGORY_KEYS.includes(categoryKey as (typeof APPEARANCE_CATEGORY_KEYS)[number])) {
    return { success: false, message: 'หมวดด่านไม่ถูกต้อง' };
  }

  const unlockedLevel = Number(unlockedLevelRaw);
  if (!Number.isFinite(unlockedLevel) || unlockedLevel < 0) {
    return { success: false, message: 'ระดับด่านไม่ถูกต้อง' };
  }

  try {
    await updateAppearanceLevel({
      categoryKey: categoryKey as (typeof APPEARANCE_CATEGORY_KEYS)[number],
      unlockedLevel,
      note: note || undefined
    });

    revalidatePath('/smv');
    revalidatePath('/smv/look');
    revalidatePath('/smv/appearance');
    revalidatePath(`/smv/appearance/${categoryKey}`);

    return { success: true, message: 'อัปเดตด่านเรียบร้อยแล้ว' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'ไม่สามารถอัปเดตด่านได้'
    };
  }
}

export async function markSocialLevelCompletedAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const levelIdRaw = String(formData.get('level_id') ?? '').trim();
  const levelId = Number(levelIdRaw);

  if (!Number.isInteger(levelId)) {
    return { success: false, message: 'ระดับด่านไม่ถูกต้อง' };
  }

  try {
    await markSocialLevelCompleted(levelId);
    revalidatePath('/smv');
    revalidatePath('/smv/social');
    return { success: true, message: 'อัปเดตผ่านด่านเรียบร้อย' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'ไม่สามารถอัปเดตด่านได้'
    };
  }
}

export async function addSocialEvidenceAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const levelId = Number(String(formData.get('level_id') ?? '').trim());
  const type = String(formData.get('type') ?? 'other').trim() as 'chat' | 'meetup' | 'connection' | 'other';
  const note = String(formData.get('note') ?? '').trim();
  const imageUrl = String(formData.get('image_url') ?? '').trim();

  if (!Number.isInteger(levelId)) {
    return { success: false, message: 'ระดับด่านไม่ถูกต้อง' };
  }

  try {
    await addSocialEvidence({
      levelId,
      type,
      note: note || undefined,
      imageUrl: imageUrl || undefined
    });
    revalidatePath('/smv');
    revalidatePath('/smv/social');
    return { success: true, message: 'เพิ่มหลักฐาน Social เรียบร้อย' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'ไม่สามารถเพิ่มหลักฐานได้'
    };
  }
}
