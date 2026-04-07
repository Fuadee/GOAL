import { supabaseRestRequest } from '@/lib/supabase/rest';
import { ExpenseRow, ExpenseType, IncomeSourceRow, IncomeSourceType, RentalHouseRow, RentalHouseStatus } from '@/lib/money/types';

export async function createIncomeSource(payload: {
  name: string;
  type: IncomeSourceType;
  expected_income: number;
  actual_income: number;
}): Promise<IncomeSourceRow> {
  const rows = await supabaseRestRequest<IncomeSourceRow[]>('income_sources', 'POST', payload);
  return rows[0];
}

export async function createExpense(payload: { category: string; amount: number; type: ExpenseType }): Promise<ExpenseRow> {
  const rows = await supabaseRestRequest<ExpenseRow[]>('expenses', 'POST', payload);
  return rows[0];
}

export async function createRentalHouse(payload: {
  name: string;
  status: RentalHouseStatus;
  monthly_income: number;
}): Promise<RentalHouseRow> {
  const rows = await supabaseRestRequest<RentalHouseRow[]>('rental_houses', 'POST', payload);
  return rows[0];
}
