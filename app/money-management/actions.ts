'use server';

import { revalidatePath } from 'next/cache';
import { createMoneyIncomeSource, softDeleteMoneyIncomeSource, updateMoneyIncomeSource } from '@/lib/money/mutations';

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
