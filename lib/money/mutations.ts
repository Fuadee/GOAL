import { supabaseRestRequest } from '@/lib/supabase/rest';
import {
  ConstructionExecutionState,
  ConstructionRiskLevel,
  ConstructionStepRow,
  ConstructionStepStatus,
  ExpenseRow,
  ExpenseType,
  IncomeSourceRow,
  IncomeSourceType,
  MoneyGoalPlanRow,
  MoneyGoalPlanStatus,
  RentalHouseRow,
  RentalHouseStatus,
  StepUpdateRow
} from '@/lib/money/types';

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

export async function updateIncomeSource(
  id: string,
  payload: {
    name: string;
    type: IncomeSourceType;
    expected_income: number;
    actual_income: number;
  }
): Promise<IncomeSourceRow> {
  const rows = await supabaseRestRequest<IncomeSourceRow[]>(`income_sources?id=eq.${id}`, 'PATCH', payload);
  return rows[0];
}

export async function updateExpense(
  id: string,
  payload: {
    category: string;
    amount: number;
    type: ExpenseType;
  }
): Promise<ExpenseRow> {
  const rows = await supabaseRestRequest<ExpenseRow[]>(`expenses?id=eq.${id}`, 'PATCH', payload);
  return rows[0];
}

export async function deleteIncomeSource(id: string): Promise<void> {
  await supabaseRestRequest<IncomeSourceRow[]>(`income_sources?id=eq.${id}`, 'DELETE');
}

export async function deleteExpense(id: string): Promise<void> {
  await supabaseRestRequest<ExpenseRow[]>(`expenses?id=eq.${id}`, 'DELETE');
}

export async function createRentalHouse(payload: {
  name: string;
  status: RentalHouseStatus;
  monthly_income: number;
}): Promise<RentalHouseRow> {
  const rows = await supabaseRestRequest<RentalHouseRow[]>('rental_houses', 'POST', payload);
  return rows[0];
}

export async function createMoneyGoalPlan(payload: { plan_name: string; net_increase: number; status: MoneyGoalPlanStatus }): Promise<MoneyGoalPlanRow> {
  const rows = await supabaseRestRequest<MoneyGoalPlanRow[]>('money_goal_plans', 'POST', payload);
  return rows[0];
}

export async function updateMoneyGoalPlan(
  id: string,
  payload: { plan_name: string; net_increase: number; status: MoneyGoalPlanStatus }
): Promise<MoneyGoalPlanRow> {
  const rows = await supabaseRestRequest<MoneyGoalPlanRow[]>(`money_goal_plans?id=eq.${id}`, 'PATCH', payload);
  return rows[0];
}

export async function deleteMoneyGoalPlan(id: string): Promise<void> {
  await supabaseRestRequest<MoneyGoalPlanRow[]>(`money_goal_plans?id=eq.${id}`, 'DELETE');
}


export async function completeConstructionStep(id: string): Promise<ConstructionStepRow> {
  const rows = await supabaseRestRequest<ConstructionStepRow[]>(`construction_steps?id=eq.${id}`, 'PATCH', {
    status: 'completed',
    is_completed: true,
    completed_at: new Date().toISOString()
  });
  return rows[0];
}

export async function createStepUpdate(stepId: string, message: string): Promise<StepUpdateRow> {
  const rows = await supabaseRestRequest<StepUpdateRow[]>('step_updates', 'POST', {
    step_id: stepId,
    message
  });
  return rows[0];
}

export async function syncConstructionStepLatestUpdate(stepId: string, latestUpdate: string): Promise<ConstructionStepRow> {
  const rows = await supabaseRestRequest<ConstructionStepRow[]>(`construction_steps?id=eq.${stepId}`, 'PATCH', {
    latest_update: latestUpdate
  });
  return rows[0];
}

export async function updateConstructionStepTargetDate(stepId: string, targetDate: string | null): Promise<ConstructionStepRow> {
  const rows = await supabaseRestRequest<ConstructionStepRow[]>(`construction_steps?id=eq.${stepId}`, 'PATCH', {
    target_date: targetDate
  });
  return rows[0];
}

export async function updateConstructionStepStatus(stepId: string, status: ConstructionStepStatus): Promise<ConstructionStepRow> {
  const rows = await supabaseRestRequest<ConstructionStepRow[]>(`construction_steps?id=eq.${stepId}`, 'PATCH', {
    status,
    is_completed: status === 'completed',
    completed_at: status === 'completed' ? new Date().toISOString() : null,
    execution_state: status === 'completed' ? 'doing' : undefined
  });
  return rows[0];
}

export async function updateConstructionExecutionState(stepId: string, executionState: ConstructionExecutionState): Promise<ConstructionStepRow> {
  const rows = await supabaseRestRequest<ConstructionStepRow[]>(`construction_steps?id=eq.${stepId}`, 'PATCH', {
    execution_state: executionState
  });
  return rows[0];
}

export async function updateConstructionWaitingDetails(
  stepId: string,
  payload: {
    waiting_on: string | null;
    waiting_since: string | null;
    expected_response_date: string | null;
    next_action_label: string | null;
    latest_update_text: string | null;
    risk_level: ConstructionRiskLevel | null;
    is_current_focus: boolean;
  }
): Promise<ConstructionStepRow> {
  const rows = await supabaseRestRequest<ConstructionStepRow[]>(`construction_steps?id=eq.${stepId}`, 'PATCH', payload);
  return rows[0];
}
