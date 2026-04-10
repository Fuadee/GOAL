'use server';

import { revalidatePath } from 'next/cache';

import {
  createExpense,
  createIncomeSource,
  createMoneyGoalPlan,
  createRentalHouse,
  deleteMoneyGoalPlan,
  deleteExpense,
  deleteIncomeSource,
  completeConstructionStep,
  updateExpense,
  updateIncomeSource,
  updateMoneyGoalPlan
} from '@/lib/money/mutations';
import { EXPENSE_TYPES, INCOME_SOURCE_TYPES, MONEY_GOAL_PLAN_STATUSES, RENTAL_HOUSE_STATUSES } from '@/lib/money/types';
import { getConstructionSteps } from '@/lib/money/queries';

const isIncomeType = (value: string): value is (typeof INCOME_SOURCE_TYPES)[number] =>
  INCOME_SOURCE_TYPES.includes(value as (typeof INCOME_SOURCE_TYPES)[number]);

const isExpenseType = (value: string): value is (typeof EXPENSE_TYPES)[number] =>
  EXPENSE_TYPES.includes(value as (typeof EXPENSE_TYPES)[number]);

const isRentalStatus = (value: string): value is (typeof RENTAL_HOUSE_STATUSES)[number] =>
  RENTAL_HOUSE_STATUSES.includes(value as (typeof RENTAL_HOUSE_STATUSES)[number]);

const isMoneyGoalPlanStatus = (value: string): value is (typeof MONEY_GOAL_PLAN_STATUSES)[number] =>
  MONEY_GOAL_PLAN_STATUSES.includes(value as (typeof MONEY_GOAL_PLAN_STATUSES)[number]);

export async function createIncomeSourceAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const id = String(formData.get('id') ?? '').trim() || null;
  const name = String(formData.get('name') ?? '').trim();
  const typeRaw = String(formData.get('type') ?? '').trim();
  const expectedRaw = Number(String(formData.get('expected_income') ?? '').trim());
  const actualRaw = Number(String(formData.get('actual_income') ?? '').trim());

  if (!name) return { success: false, message: 'Name is required.' };
  if (!isIncomeType(typeRaw)) return { success: false, message: 'Income type is invalid.' };
  if (!Number.isFinite(expectedRaw) || expectedRaw < 0) return { success: false, message: 'Expected income must be 0 or greater.' };
  if (!Number.isFinite(actualRaw) || actualRaw < 0) return { success: false, message: 'Actual income must be 0 or greater.' };

  if (id) {
    await updateIncomeSource(id, { name, type: typeRaw, expected_income: expectedRaw, actual_income: actualRaw });
  } else {
    await createIncomeSource({ name, type: typeRaw, expected_income: expectedRaw, actual_income: actualRaw });
  }
  revalidatePath('/money-management');
  revalidatePath('/money-management/income');
  return { success: true, message: id ? 'Income source updated.' : 'Income source added.' };
}

export async function createExpenseAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const id = String(formData.get('id') ?? '').trim() || null;
  const category = String(formData.get('category') ?? '').trim();
  const typeRaw = String(formData.get('type') ?? '').trim();
  const amount = Number(String(formData.get('amount') ?? '').trim());

  if (!category) return { success: false, message: 'Category is required.' };
  if (!isExpenseType(typeRaw)) return { success: false, message: 'Expense type is invalid.' };
  if (!Number.isFinite(amount) || amount < 0) return { success: false, message: 'Amount must be 0 or greater.' };

  if (id) {
    await updateExpense(id, { category, type: typeRaw, amount });
  } else {
    await createExpense({ category, type: typeRaw, amount });
  }
  revalidatePath('/money-management');
  revalidatePath('/money-management/expenses');
  return { success: true, message: id ? 'Expense updated.' : 'Expense added.' };
}

export async function createRentalHouseAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const name = String(formData.get('name') ?? '').trim();
  const statusRaw = String(formData.get('status') ?? '').trim();
  const monthlyIncome = Number(String(formData.get('monthly_income') ?? '').trim());

  if (!name) return { success: false, message: 'Name is required.' };
  if (!isRentalStatus(statusRaw)) return { success: false, message: 'Status is invalid.' };
  if (!Number.isFinite(monthlyIncome) || monthlyIncome < 0) return { success: false, message: 'Monthly income must be 0 or greater.' };

  await createRentalHouse({ name, status: statusRaw, monthly_income: monthlyIncome });
  revalidatePath('/money-management');
  return { success: true, message: 'Rental house plan added.' };
}

export async function deleteIncomeSourceAction(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) return { success: false, message: 'Income source id is required.' };

  await deleteIncomeSource(id);
  revalidatePath('/money-management');
  revalidatePath('/money-management/income');
  return { success: true, message: 'Income source deleted.' };
}

export async function deleteExpenseAction(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) return { success: false, message: 'Expense id is required.' };

  await deleteExpense(id);
  revalidatePath('/money-management');
  revalidatePath('/money-management/expenses');
  return { success: true, message: 'Expense deleted.' };
}

export async function createMoneyGoalPlanAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const id = String(formData.get('id') ?? '').trim() || null;
  const planName = String(formData.get('plan_name') ?? '').trim();
  const statusRaw = String(formData.get('status') ?? '').trim();
  const netIncrease = Number(String(formData.get('net_increase') ?? '').trim());

  if (!planName) return { success: false, message: 'Plan name is required.' };
  if (!isMoneyGoalPlanStatus(statusRaw)) return { success: false, message: 'Plan status is invalid.' };
  if (!Number.isFinite(netIncrease) || netIncrease < 0) return { success: false, message: 'Net increase must be 0 or greater.' };

  if (id) {
    await updateMoneyGoalPlan(id, { plan_name: planName, net_increase: netIncrease, status: statusRaw });
  } else {
    await createMoneyGoalPlan({ plan_name: planName, net_increase: netIncrease, status: statusRaw });
  }

  revalidatePath('/money-management/plan');
  revalidatePath('/money-management');
  return { success: true, message: id ? 'Plan updated.' : 'Plan added.' };
}

export async function deleteMoneyGoalPlanAction(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) return { success: false, message: 'Plan id is required.' };

  await deleteMoneyGoalPlan(id);
  revalidatePath('/money-management/plan');
  revalidatePath('/money-management');
  return { success: true, message: 'Plan deleted.' };
}


export async function markConstructionStepCompletedAction(stepId: string): Promise<{ success: boolean; message: string }> {
  if (!stepId) return { success: false, message: 'Step id is required.' };

  const steps = await getConstructionSteps();
  const targetStep = steps.find((step) => step.id === stepId);

  if (!targetStep) return { success: false, message: 'Step not found.' };
  if (targetStep.is_completed) return { success: true, message: 'Step already completed.' };

  await completeConstructionStep(stepId);

  revalidatePath('/money-management');
  return { success: true, message: 'Construction step updated.' };
}
