'use server';

import { revalidatePath } from 'next/cache';

import { createExpense, createIncomeSource, createRentalHouse } from '@/lib/money/mutations';
import { EXPENSE_TYPES, INCOME_SOURCE_TYPES, RENTAL_HOUSE_STATUSES } from '@/lib/money/types';

const isIncomeType = (value: string): value is (typeof INCOME_SOURCE_TYPES)[number] =>
  INCOME_SOURCE_TYPES.includes(value as (typeof INCOME_SOURCE_TYPES)[number]);

const isExpenseType = (value: string): value is (typeof EXPENSE_TYPES)[number] =>
  EXPENSE_TYPES.includes(value as (typeof EXPENSE_TYPES)[number]);

const isRentalStatus = (value: string): value is (typeof RENTAL_HOUSE_STATUSES)[number] =>
  RENTAL_HOUSE_STATUSES.includes(value as (typeof RENTAL_HOUSE_STATUSES)[number]);

export async function createIncomeSourceAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const name = String(formData.get('name') ?? '').trim();
  const typeRaw = String(formData.get('type') ?? '').trim();
  const expectedRaw = Number(String(formData.get('expected_income') ?? '').trim());
  const actualRaw = Number(String(formData.get('actual_income') ?? '').trim());

  if (!name) return { success: false, message: 'Name is required.' };
  if (!isIncomeType(typeRaw)) return { success: false, message: 'Income type is invalid.' };
  if (!Number.isFinite(expectedRaw) || expectedRaw < 0) return { success: false, message: 'Expected income must be 0 or greater.' };
  if (!Number.isFinite(actualRaw) || actualRaw < 0) return { success: false, message: 'Actual income must be 0 or greater.' };

  await createIncomeSource({ name, type: typeRaw, expected_income: expectedRaw, actual_income: actualRaw });
  revalidatePath('/money-management');
  return { success: true, message: 'Income source added.' };
}

export async function createExpenseAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  const category = String(formData.get('category') ?? '').trim();
  const typeRaw = String(formData.get('type') ?? '').trim();
  const amount = Number(String(formData.get('amount') ?? '').trim());

  if (!category) return { success: false, message: 'Category is required.' };
  if (!isExpenseType(typeRaw)) return { success: false, message: 'Expense type is invalid.' };
  if (!Number.isFinite(amount) || amount < 0) return { success: false, message: 'Amount must be 0 or greater.' };

  await createExpense({ category, type: typeRaw, amount });
  revalidatePath('/money-management');
  return { success: true, message: 'Expense added.' };
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
