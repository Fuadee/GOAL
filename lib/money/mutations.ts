import { supabaseRestRequest } from '@/lib/supabase/rest';
import { MoneyIncomeSourceRow } from '@/lib/money/types';

export async function createMoneyIncomeSource(payload: {
  name: string;
  description?: string | null;
  income_amount: number;
  expense_amount: number;
  expense_note?: string | null;
  sort_order?: number;
}): Promise<MoneyIncomeSourceRow> {
  const rows = await supabaseRestRequest<MoneyIncomeSourceRow[]>('money_income_sources', 'POST', payload);
  return rows[0];
}

export async function updateMoneyIncomeSource(
  id: string,
  payload: {
    name: string;
    description?: string | null;
    income_amount: number;
    expense_amount: number;
    expense_note?: string | null;
  }
): Promise<MoneyIncomeSourceRow> {
  const rows = await supabaseRestRequest<MoneyIncomeSourceRow[]>(`money_income_sources?id=eq.${id}`, 'PATCH', payload);
  return rows[0];
}

export async function softDeleteMoneyIncomeSource(id: string): Promise<void> {
  await supabaseRestRequest<MoneyIncomeSourceRow[]>(`money_income_sources?id=eq.${id}`, 'PATCH', { is_active: false });
}
