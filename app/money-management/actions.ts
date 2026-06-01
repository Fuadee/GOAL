'use server';

import { revalidatePath } from 'next/cache';
import { createAssetMonthlySnapshot, createGrowthAsset, createMoneyIncomeSource, deleteGrowthAsset, findAssetMonthlySnapshotByMonth, replaceAssetMonthlySnapshotItems, softDeleteMoneyIncomeSource, updateAssetMonthlySnapshot, updateGrowthAsset, updateMoneyIncomeSource } from '@/lib/money/mutations';
import { GROWTH_ASSET_TYPES, GrowthAssetType } from '@/lib/money/types';

const toNumber = (value: FormDataEntryValue | null) => {
  if (value == null || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
};

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
