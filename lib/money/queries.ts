import { supabaseRestRequest } from '@/lib/supabase/rest';
import { ExpenseRow, IncomeSourceRow, RentalHouseRow } from '@/lib/money/types';

export async function getIncomeSources(): Promise<IncomeSourceRow[]> {
  return supabaseRestRequest<IncomeSourceRow[]>('income_sources?select=*&order=created_at.desc', 'GET');
}

export async function getExpenses(): Promise<ExpenseRow[]> {
  return supabaseRestRequest<ExpenseRow[]>('expenses?select=*', 'GET');
}

export async function getRentalHouses(): Promise<RentalHouseRow[]> {
  return supabaseRestRequest<RentalHouseRow[]>('rental_houses?select=*', 'GET');
}
