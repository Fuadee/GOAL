'use server';

import { revalidatePath } from 'next/cache';

import { addSocialEvidence, createEvidenceAndRecalculate, markConfidenceStagePassed, markSocialLevelCompleted, updateAppearanceLevel } from '@/lib/smv/service';
import {
  createSmvActionLog,
  createSmvScoreHistory,
  getSmvDimensionScore,
  getSmvDimensions,
  getSmvMetrics,
  upsertSmvDimensionScore
} from '@/lib/smv/repository';
import { APPEARANCE_CATEGORY_KEYS } from '@/lib/smv/appearance-config';
import { createSmvProject, deleteSmvProject, updateSmvProject } from '@/lib/smv/projects';
import { createProjectMilestone, deleteProjectMilestone, updateProjectMilestone } from '@/lib/smv/milestones';
import { createMilestoneChecklist, deleteMilestoneChecklist, setMilestoneChecklistCompleted, updateMilestoneChecklist } from '@/lib/smv/checklists';

function validateChecklistForm(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const projectId = String(formData.get('project_id') ?? '').trim();
  const milestoneId = String(formData.get('milestone_id') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  if (!projectId || !milestoneId) return { success: false as const, message: 'ไม่พบ Milestone ที่ต้องการ' };
  if (!title) return { success: false as const, message: 'กรุณากรอกชื่อรายการ' };
  if (title.length > 160) return { success: false as const, message: 'ชื่อรายการต้องไม่เกิน 160 ตัวอักษร' };
  if (description.length > 2000) return { success: false as const, message: 'รายละเอียดต้องไม่เกิน 2,000 ตัวอักษร' };
  return { success: true as const, id, projectId, milestoneId, title, description };
}

export async function saveSmvMilestoneChecklistAction(formData: FormData) {
  const input = validateChecklistForm(formData);
  if (!input.success) return input;
  try {
    const checklist = input.id
      ? await updateMilestoneChecklist({ id: input.id, milestoneId: input.milestoneId, title: input.title, description: input.description })
      : await createMilestoneChecklist({ milestoneId: input.milestoneId, title: input.title, description: input.description });
    revalidatePath(`/smv/${input.projectId}`);
    revalidatePath(`/smv/${input.projectId}/milestones/${input.milestoneId}`);
    return { success: true as const, message: input.id ? 'แก้ไขรายการแล้ว' : 'เพิ่มรายการแล้ว', checklist };
  } catch {
    return { success: false as const, message: 'ไม่สามารถบันทึกรายการได้ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function toggleSmvMilestoneChecklistAction(id: string, milestoneId: string, projectId: string, isCompleted: boolean) {
  if (!id || !milestoneId || !projectId) return { success: false as const, message: 'ข้อมูลรายการไม่ครบถ้วน' };
  try {
    const checklist = await setMilestoneChecklistCompleted({ id, milestoneId, isCompleted });
    revalidatePath(`/smv/${projectId}`);
    revalidatePath(`/smv/${projectId}/milestones/${milestoneId}`);
    return { success: true as const, message: 'อัปเดตสถานะแล้ว', checklist };
  } catch {
    return { success: false as const, message: 'ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function deleteSmvMilestoneChecklistAction(id: string, milestoneId: string, projectId: string) {
  if (!id || !milestoneId || !projectId) return { success: false as const, message: 'ข้อมูลรายการไม่ครบถ้วน' };
  try {
    await deleteMilestoneChecklist({ id, milestoneId });
    revalidatePath(`/smv/${projectId}`);
    revalidatePath(`/smv/${projectId}/milestones/${milestoneId}`);
    return { success: true as const, message: 'ลบรายการแล้ว' };
  } catch {
    return { success: false as const, message: 'ไม่สามารถลบรายการได้ กรุณาลองใหม่อีกครั้ง' };
  }
}

function validateMilestoneForm(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const projectId = String(formData.get('project_id') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  if (!projectId) return { success: false as const, message: 'ไม่พบโปรเจกต์ที่ต้องการ' };
  if (!title) return { success: false as const, message: 'กรุณากรอกชื่อ Milestone' };
  if (title.length > 160) return { success: false as const, message: 'ชื่อ Milestone ต้องไม่เกิน 160 ตัวอักษร' };
  if (description.length > 2000) return { success: false as const, message: 'รายละเอียดต้องไม่เกิน 2,000 ตัวอักษร' };
  return { success: true as const, id, projectId, title, description };
}

export async function saveSmvProjectMilestoneAction(formData: FormData) {
  const input = validateMilestoneForm(formData);
  if (!input.success) return input;
  try {
    const milestone = input.id
      ? await updateProjectMilestone({ id: input.id, projectId: input.projectId, title: input.title, description: input.description })
      : await createProjectMilestone({ projectId: input.projectId, title: input.title, description: input.description });
    revalidatePath(`/smv/${input.projectId}`);
    return { success: true as const, message: input.id ? 'อัปเดต Milestone แล้ว' : 'สร้าง Milestone แล้ว', milestone };
  } catch {
    return { success: false as const, message: 'ไม่สามารถบันทึก Milestone ได้ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function deleteSmvProjectMilestoneAction(id: string, projectId: string) {
  if (!id || !projectId) return { success: false as const, message: 'ข้อมูล Milestone ไม่ครบถ้วน' };
  try {
    await deleteProjectMilestone({ id, projectId });
    revalidatePath(`/smv/${projectId}`);
    return { success: true as const, message: 'ลบ Milestone แล้ว' };
  } catch {
    return { success: false as const, message: 'ไม่สามารถลบ Milestone ได้ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function createSmvProjectAction(formData: FormData) {
  return saveSmvProjectAction(formData);
}

export async function saveSmvProjectAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!title) return { success: false as const, message: 'กรุณากรอกชื่อโปรเจกต์' };
  if (title.length > 160) return { success: false as const, message: 'ชื่อโปรเจกต์ต้องไม่เกิน 160 ตัวอักษร' };
  if (description.length > 2000) return { success: false as const, message: 'รายละเอียดต้องไม่เกิน 2,000 ตัวอักษร' };

  try {
    const project = id
      ? await updateSmvProject({ id, title, description })
      : await createSmvProject({ title, description });
    revalidatePath('/smv');
    if (id) revalidatePath(`/smv/${id}`);
    return { success: true as const, message: id ? 'แก้ไขโปรเจกต์แล้ว' : 'สร้างโปรเจกต์แล้ว', project };
  } catch {
    return { success: false as const, message: 'ไม่สามารถบันทึกโปรเจกต์ได้ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function deleteSmvProjectAction(id: string) {
  if (!id) return { success: false as const, message: 'ไม่พบโปรเจกต์ที่ต้องการลบ' };
  try {
    await deleteSmvProject(id);
    revalidatePath('/smv');
    return { success: true as const, message: 'ลบโปรเจกต์แล้ว' };
  } catch {
    return { success: false as const, message: 'ไม่สามารถลบโปรเจกต์ได้ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function completeSmvChecklistItemAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const dimensionId = String(formData.get('dimension_id') ?? '').trim();
  const checklistItemId = String(formData.get('checklist_item_id') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();

  if (!dimensionId || !checklistItemId) {
    return { success: false, message: 'Missing checklist payload.' };
  }

  try {
    await createEvidenceAndRecalculate({
      dimensionId,
      context: `Checklist completion (${checklistItemId})`,
      note: notes || undefined,
      evidenceType: 'checklist_completion',
      metricValues: []
    });

    revalidatePath('/smv');
    return { success: true, message: 'Checklist item completed.' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Could not complete checklist item.'
    };
  }
}

export async function manuallyAdjustSmvScoreAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const dimensionId = String(formData.get('dimension_id') ?? '').trim();
  const reason = String(formData.get('reason') ?? '').trim();
  const newScoreRaw = String(formData.get('new_score') ?? '').trim();
  const newScore = Number(newScoreRaw);

  if (!dimensionId) {
    return { success: false, message: 'Dimension is required.' };
  }
  if (!reason) {
    return { success: false, message: 'Reason is required.' };
  }
  if (!Number.isFinite(newScore) || newScore < 0 || newScore > 100) {
    return { success: false, message: 'New score must be between 0 and 100.' };
  }

  try {
    const current = await getSmvDimensionScore(dimensionId);
    const scoreBefore = Number(current?.score ?? 0);
    const scoreAfter = Math.round(newScore * 100) / 100;
    const scoreDelta = scoreAfter - scoreBefore;

    await upsertSmvDimensionScore({
      dimension_id: dimensionId,
      score: scoreAfter,
      evidence_count_30d: current?.evidence_count_30d ?? 0,
      guard_summary: current?.guard_summary ?? 'Manual adjustment',
      explanation: `Manual adjustment: ${reason}`
    });

    await createSmvScoreHistory({
      dimension_id: dimensionId,
      score: scoreAfter,
      evidence_count_30d: current?.evidence_count_30d ?? 0,
      guard_summary: current?.guard_summary ?? 'Manual adjustment',
      explanation: `manual_adjustment (${scoreBefore} -> ${scoreAfter})`,
      score_breakdown: {
        score_before: scoreBefore,
        score_delta: scoreDelta,
        score_after: scoreAfter
      }
    });

    revalidatePath('/smv');
    return { success: true, message: 'Score adjusted successfully.' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Could not adjust score.'
    };
  }
}

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

export async function markSocialLevelCompletedAction(formData: FormData): Promise<void> {
  const levelIdRaw = String(formData.get('level_id') ?? '').trim();
  const levelId = Number(levelIdRaw);

  if (!Number.isInteger(levelId)) {
    throw new Error('ระดับด่านไม่ถูกต้อง');
  }

  try {
    await markSocialLevelCompleted(levelId);
    revalidatePath('/smv');
    revalidatePath('/smv/social');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'ไม่สามารถอัปเดตด่านได้');
  }
}

export async function addSocialEvidenceAction(formData: FormData): Promise<void> {
  const levelId = Number(String(formData.get('level_id') ?? '').trim());
  const type = String(formData.get('type') ?? 'other').trim() as 'chat' | 'meetup' | 'connection' | 'other';
  const note = String(formData.get('note') ?? '').trim();
  const imageUrl = String(formData.get('image_url') ?? '').trim();

  if (!Number.isInteger(levelId)) {
    throw new Error('ระดับด่านไม่ถูกต้อง');
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
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'ไม่สามารถเพิ่มหลักฐานได้');
  }
}
