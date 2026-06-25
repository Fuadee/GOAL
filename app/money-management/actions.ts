'use server';

import { revalidatePath } from 'next/cache';
import { clearConstructionExpenseCategory, createAssetMonthlySnapshot, createConstructionCategory, createConstructionExpense, createConstructionProject, createGrowthAsset, createMoneyIncomeSource, deleteConstructionCategory, deleteConstructionExpense, deleteGrowthAsset, findAssetMonthlySnapshotByMonth, replaceAssetMonthlySnapshotItems, softDeleteMoneyIncomeSource, updateAssetMonthlySnapshot, updateConstructionCategory, updateConstructionExpense, updateGrowthAsset, updateMoneyIncomeSource } from '@/lib/money/mutations';
import { CONSTRUCTION_CATEGORY_STATUSES, CONSTRUCTION_COST_TYPES, ConstructionCategoryStatus, ConstructionCostType, GROWTH_ASSET_TYPES, GrowthAssetType } from '@/lib/money/types';

const toNumber = (value: FormDataEntryValue | null) => {
  if (value == null || value === '') return 0;
  const normalized = String(value).replace(/,/g, '').trim();
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
};

const isConstructionCategoryStatus = (value: string): value is ConstructionCategoryStatus =>
  CONSTRUCTION_CATEGORY_STATUSES.includes(value as ConstructionCategoryStatus);

const isConstructionCostType = (value: string): value is ConstructionCostType =>
  CONSTRUCTION_COST_TYPES.includes(value as ConstructionCostType);

const constructionProjectStatuses = ['planning', 'active', 'completed', 'paused'] as const;

export async function upsertMoneyIncomeSourceAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const id = String(formData.get('id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const expenseNote = String(formData.get('expense_note') ?? '').trim();
  const incomeAmount = toNumber(formData.get('income_amount'));
  const expenseAmount = toNumber(formData.get('expense_amount'));

  if (!name) return { success: false, message: 'กรุณากรอกชื่อแหล่งรายได้' };
  if (Number.isNaN(incomeAmount) || Number.isNaN(expenseAmount)) return { success: false, message: 'จำนวนเงินไม่ถูกต้อง' };

  try {
    if (id) {
      await updateMoneyIncomeSource(id, { name, description: description || null, income_amount: incomeAmount, expense_amount: expenseAmount, expense_note: expenseNote || null });
    } else {
      await createMoneyIncomeSource({ name, description: description || null, income_amount: incomeAmount, expense_amount: expenseAmount, expense_note: expenseNote || null });
    }

    revalidatePath('/money-management');
    return { success: true, message: 'บันทึกสำเร็จ' };
  } catch (error) {
    console.error('[money-management load failed]', error);
    return { success: false, message: 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function deleteMoneyIncomeSourceAction(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) return { success: false, message: 'ไม่พบรายการ' };
  try {
    await softDeleteMoneyIncomeSource(id);
    revalidatePath('/money-management');
    return { success: true, message: 'ลบรายการสำเร็จ' };
  } catch (error) {
    console.error('[money-management delete failed]', error);
    return { success: false, message: 'ลบรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function createIncomeSourceAction(formData: FormData) { return upsertMoneyIncomeSourceAction(formData); }
export async function deleteIncomeSourceAction(id: string) { return deleteMoneyIncomeSourceAction(id); }
export async function upsertGrowthAssetAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const id = String(formData.get('id') ?? '').trim();
  const assetName = String(formData.get('asset_name') ?? '').trim();
  const assetType = String(formData.get('asset_type') ?? '').trim() as GrowthAssetType;
  const investedAmount = toNumber(formData.get('invested_amount'));
  const currentValue = toNumber(formData.get('current_value'));

  if (!assetName) return { success: false, message: 'กรุณากรอกชื่อสินทรัพย์' };
  if (!GROWTH_ASSET_TYPES.includes(assetType)) return { success: false, message: 'ประเภทสินทรัพย์ไม่ถูกต้อง' };
  if (Number.isNaN(investedAmount) || Number.isNaN(currentValue)) return { success: false, message: 'จำนวนเงินไม่ถูกต้อง' };

  try {
    const payload = { asset_name: assetName, asset_type: assetType, invested_amount: investedAmount, current_value: currentValue };
    if (id) await updateGrowthAsset(id, payload);
    else await createGrowthAsset(payload);
    revalidatePath('/money-management');
    return { success: true, message: 'บันทึกสินทรัพย์สำเร็จ' };
  } catch (error) {
    console.error('[growth-assets upsert failed]', error);
    return { success: false, message: 'บันทึกสินทรัพย์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function deleteGrowthAssetAction(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) return { success: false, message: 'ไม่พบรายการ' };
  try {
    await deleteGrowthAsset(id);
    revalidatePath('/money-management');
    return { success: true, message: 'ลบสินทรัพย์สำเร็จ' };
  } catch (error) {
    console.error('[growth-assets delete failed]', error);
    return { success: false, message: 'ลบสินทรัพย์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' };
  }
}
export async function createExpenseAction(...args: unknown[]) { void args; return { success: false, message: 'Deprecated' }; }
export async function createRentalHouseAction(...args: unknown[]) { void args; return { success: false, message: 'Deprecated' }; }
export async function deleteExpenseAction(...args: unknown[]) { void args; return { success: false, message: 'Deprecated' }; }
export async function createMoneyGoalPlanAction(...args: unknown[]) { void args; return { success: false, message: 'Deprecated' }; }
export async function deleteMoneyGoalPlanAction(...args: unknown[]) { void args; return { success: false, message: 'Deprecated' }; }
export async function markConstructionStepCompletedAction(...args: unknown[]) { void args; return { success: false, message: 'Deprecated' }; }
export async function addConstructionStepUpdateAction(...args: unknown[]) { void args; return { success: false, message: 'Deprecated' }; }
export async function updateConstructionStepTargetDateAction(...args: unknown[]) { void args; return { success: false, message: 'Deprecated' }; }
export async function updateConstructionStepStatusAction(...args: unknown[]) { void args; return { success: false, message: 'Deprecated' }; }
export async function updateConstructionExecutionStateAction(...args: unknown[]) { void args; return { success: false, message: 'Deprecated' }; }
export async function updateConstructionWaitingDetailsAction(...args: unknown[]) { void args; return { success: false, message: 'Deprecated' }; }
export async function markConstructionResponseReceivedAction(...args: unknown[]) { void args; return { success: false, message: 'Deprecated' }; }

export async function saveAssetMonthlySnapshotAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const rawMonth = String(formData.get('snapshot_month') ?? '').trim();
  const snapshotMonth = /^\d{4}-\d{2}$/.test(rawMonth) ? `${rawMonth}-01` : rawMonth;
  if (!/^\d{4}-\d{2}-01$/.test(snapshotMonth)) return { success: false, message: 'เดือน/ปีไม่ถูกต้อง' };

  const assetIds = formData.getAll('asset_id').map((value) => String(value ?? '').trim());
  const assetNames = formData.getAll('asset_name').map((value) => String(value ?? '').trim());
  const assetTypes = formData.getAll('asset_type').map((value) => String(value ?? '').trim() as GrowthAssetType);
  const values = formData.getAll('value').map(toNumber);

  if (assetNames.length === 0) return { success: false, message: 'ยังไม่มีสินทรัพย์สำหรับสร้าง Snapshot' };
  if (values.some(Number.isNaN)) return { success: false, message: 'มูลค่าสินทรัพย์ไม่ถูกต้อง' };

  const items = assetNames.map((assetName, index) => ({
    asset_id: assetIds[index] || null,
    asset_name: assetName,
    asset_type: assetTypes[index],
    value: values[index] ?? 0,
  })).filter((item) => item.asset_name && GROWTH_ASSET_TYPES.includes(item.asset_type));

  if (items.length !== assetNames.length) return { success: false, message: 'ข้อมูลสินทรัพย์ไม่ครบถ้วน' };

  try {
    const totalValue = items.reduce((sum, item) => sum + item.value, 0);
    const existingSnapshot = await findAssetMonthlySnapshotByMonth(snapshotMonth);
    const snapshot = existingSnapshot
      ? await updateAssetMonthlySnapshot(existingSnapshot.id, { total_value: totalValue })
      : await createAssetMonthlySnapshot({ snapshot_month: snapshotMonth, total_value: totalValue });

    await replaceAssetMonthlySnapshotItems(snapshot.id, items);
    revalidatePath('/money-management');
    return { success: true, message: 'บันทึก Snapshot สำเร็จ' };
  } catch (error) {
    console.error('[asset-monthly-snapshot save failed]', error);
    return { success: false, message: 'บันทึก Snapshot ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function createConstructionProjectAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const status = String(formData.get('status') ?? 'planning').trim();
  const createDefaultCategory = String(formData.get('create_default_category') ?? '') === 'on';

  if (!name) return { success: false, message: 'กรุณากรอกชื่อโครงการ' };
  if (!constructionProjectStatuses.includes(status as (typeof constructionProjectStatuses)[number])) {
    return { success: false, message: 'สถานะโครงการไม่ถูกต้อง' };
  }

  try {
    const project = await createConstructionProject({
      name,
      description: description || null,
      status,
      total_budget: 0,
    });

    if (createDefaultCategory) {
      await createConstructionCategory({
        project_id: project.id,
        name: 'อื่น ๆ',
        budget: 0,
        labor_budget: 0,
        status: 'not_started',
        sort_order: 10,
      });
    }

    revalidatePath('/money-management');
    return { success: true, message: 'สร้างโครงการสำเร็จ' };
  } catch (error) {
    console.error('[construction-project create failed]', error);
    return { success: false, message: 'สร้างโครงการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function upsertConstructionCategoryAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const id = String(formData.get('id') ?? '').trim();
  const projectId = String(formData.get('project_id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const budget = toNumber(formData.get('budget'));
  const laborBudget = toNumber(formData.get('labor_budget'));
  const status = String(formData.get('status') ?? '').trim();
  const sortOrder = toNumber(formData.get('sort_order'));
  const operationDetail = String(formData.get('operation_detail') ?? '').trim();
  const operationNote = String(formData.get('operation_note') ?? '').trim();
  const operationChecklistRaw = formData.get('operation_checklist');
  const hasOperationFields = formData.has('operation_detail') || formData.has('operation_note') || formData.has('operation_checklist');

  if (!id && !projectId) return { success: false, message: 'ไม่พบโครงการ' };
  if (!name) return { success: false, message: 'กรุณากรอกชื่อหมวดงาน' };
  if (Number.isNaN(budget)) return { success: false, message: 'งบประมาณไม่ถูกต้อง' };
  if (Number.isNaN(laborBudget)) return { success: false, message: 'งบค่าแรงไม่ถูกต้อง' };
  if (!isConstructionCategoryStatus(status)) return { success: false, message: 'สถานะหมวดงานไม่ถูกต้อง' };
  let operationChecklist: { id: string; title: string; done: boolean }[] | undefined;
  if (hasOperationFields) {
    try {
      const parsed = operationChecklistRaw ? JSON.parse(String(operationChecklistRaw)) : [];
      operationChecklist = Array.isArray(parsed)
        ? parsed
            .map((item) => ({
              id: String(item?.id ?? '').trim(),
              title: String(item?.title ?? '').trim(),
              done: Boolean(item?.done),
            }))
            .filter((item) => item.title)
        : [];
    } catch {
      return { success: false, message: 'Checklist ไม่ถูกต้อง' };
    }
  }

  try {
    const operationPayload = hasOperationFields ? {
      operation_detail: operationDetail || null,
      operation_note: operationNote || null,
      operation_checklist: operationChecklist ?? [],
    } : {};
    if (id) {
      await updateConstructionCategory(id, { name, budget, labor_budget: laborBudget, status, ...operationPayload });
    } else {
      await createConstructionCategory({ project_id: projectId, name, budget, labor_budget: laborBudget, status, ...operationPayload, sort_order: Number.isNaN(sortOrder) ? 0 : sortOrder });
    }
    revalidatePath('/money-management');
    return { success: true, message: 'บันทึกหมวดงานสำเร็จ' };
  } catch (error) {
    console.error('[construction-category upsert failed]', error);
    return { success: false, message: 'บันทึกหมวดงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function deleteConstructionCategoryAction(categoryId: string): Promise<{ success: boolean; message: string }> {
  if (!categoryId) return { success: false, message: 'ไม่พบหมวดงาน' };
  try {
    await clearConstructionExpenseCategory(categoryId);
    await deleteConstructionCategory(categoryId);
    revalidatePath('/money-management');
    return { success: true, message: 'ลบหมวดงานสำเร็จ' };
  } catch (error) {
    console.error('[construction-category delete failed]', error);
    return { success: false, message: 'ลบหมวดงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function createConstructionExpenseAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const projectId = String(formData.get('project_id') ?? '').trim();
  const rawCategoryId = String(formData.get('category_id') ?? '').trim();
  const costTypeValue = String(formData.get('cost_type') ?? 'material').trim();
  const expenseDate = String(formData.get('expense_date') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const amount = toNumber(formData.get('amount'));
  const note = String(formData.get('note') ?? '').trim();

  if (!projectId) return { success: false, message: 'ไม่พบโครงการ' };
  if (!isConstructionCostType(costTypeValue)) return { success: false, message: 'กลุ่มรายการไม่ถูกต้อง' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)) return { success: false, message: 'วันที่ไม่ถูกต้อง' };
  if (!title) return { success: false, message: 'กรุณากรอกรายการค่าใช้จ่าย' };
  if (Number.isNaN(amount) || amount <= 0) return { success: false, message: 'จำนวนเงินต้องมากกว่า 0' };

  try {
    await createConstructionExpense({
      project_id: projectId,
      category_id: rawCategoryId || null,
      cost_type: costTypeValue,
      expense_date: expenseDate,
      title,
      amount,
      note: note || null,
    });
    revalidatePath('/money-management');
    return { success: true, message: 'เพิ่มค่าใช้จ่ายจริงสำเร็จ' };
  } catch (error) {
    console.error('[construction-expense create failed]', error);
    return { success: false, message: 'เพิ่มค่าใช้จ่ายไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function updateConstructionExpenseAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const id = String(formData.get('id') ?? '').trim();
  const rawCategoryId = String(formData.get('category_id') ?? '').trim();
  const costTypeValue = String(formData.get('cost_type') ?? 'material').trim();
  const expenseDate = String(formData.get('expense_date') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const amount = toNumber(formData.get('amount'));
  const note = String(formData.get('note') ?? '').trim();

  if (!id) return { success: false, message: 'ไม่พบรายการค่าใช้จ่าย' };
  if (!isConstructionCostType(costTypeValue)) return { success: false, message: 'กลุ่มรายการไม่ถูกต้อง' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)) return { success: false, message: 'วันที่ไม่ถูกต้อง' };
  if (!title) return { success: false, message: 'กรุณากรอกรายการค่าใช้จ่าย' };
  if (Number.isNaN(amount) || amount <= 0) return { success: false, message: 'จำนวนเงินต้องมากกว่า 0' };

  try {
    await updateConstructionExpense(id, {
      category_id: rawCategoryId || null,
      cost_type: costTypeValue,
      expense_date: expenseDate,
      title,
      amount,
      note: note || null,
    });
    revalidatePath('/money-management');
    return { success: true, message: 'แก้ไขค่าใช้จ่ายสำเร็จ' };
  } catch (error) {
    console.error('[construction-expense update failed]', error);
    return { success: false, message: 'แก้ไขค่าใช้จ่ายไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function deleteConstructionExpenseAction(expenseId: string): Promise<{ success: boolean; message: string }> {
  if (!expenseId) return { success: false, message: 'ไม่พบรายการค่าใช้จ่าย' };
  try {
    await deleteConstructionExpense(expenseId);
    revalidatePath('/money-management');
    return { success: true, message: 'ลบค่าใช้จ่ายสำเร็จ' };
  } catch (error) {
    console.error('[construction-expense delete failed]', error);
    return { success: false, message: 'ลบค่าใช้จ่ายไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' };
  }
}
