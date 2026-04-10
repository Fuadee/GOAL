import { supabaseRestRequest } from '@/lib/supabase/rest';
import { ConstructionStepRow, ExpenseRow, IncomeSourceRow, MoneyGoalPlanRow, RentalHouseRow } from '@/lib/money/types';

export async function getIncomeSources(): Promise<IncomeSourceRow[]> {
  return supabaseRestRequest<IncomeSourceRow[]>('income_sources?select=*&order=created_at.desc', 'GET');
}

export async function getExpenses(): Promise<ExpenseRow[]> {
  return supabaseRestRequest<ExpenseRow[]>('expenses?select=*', 'GET');
}

export async function getRentalHouses(): Promise<RentalHouseRow[]> {
  return supabaseRestRequest<RentalHouseRow[]>('rental_houses?select=*', 'GET');
}

export async function getMoneyGoalPlans(): Promise<MoneyGoalPlanRow[]> {
  return supabaseRestRequest<MoneyGoalPlanRow[]>('money_goal_plans?select=*&order=created_at.desc', 'GET');
}


export async function getConstructionSteps(): Promise<ConstructionStepRow[]> {
  return supabaseRestRequest<ConstructionStepRow[]>('construction_steps?select=*&order=step_order.asc', 'GET');
}
