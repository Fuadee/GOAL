'use server';

import { revalidatePath } from 'next/cache';

import { createEvidenceAndRecalculate, markConfidenceStagePassed } from '@/lib/smv/service';
import { createSmvActionLog, getSmvDimensions, getSmvMetrics } from '@/lib/smv/repository';

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

  if (metricValues.length === 0) {
    return { success: false, message: 'At least one metric value is required.' };
  }

  try {
    await createEvidenceAndRecalculate({
      dimensionId,
      context,
      note,
      metricValues
    });

    revalidatePath('/smv');
    revalidatePath('/smv/log');
    revalidatePath('/smv/plan');
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
