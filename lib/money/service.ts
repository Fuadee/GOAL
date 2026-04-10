import { getConstructionSteps, getExpenses, getIncomeSources, getMoneyGoalPlans, getStepUpdates } from '@/lib/money/queries';
import { ExpenseManagementPageData, IncomeManagementPageData, MoneyDashboardData, MoneyGoalPlanStatus, MoneyPlanPageData } from '@/lib/money/types';

const TARGET_INCOME = 100000;
const ACTIVE_PLAN_STATUSES: MoneyGoalPlanStatus[] = ['planned', 'in_progress', 'completed'];

export async function getMoneyDashboardData(): Promise<MoneyDashboardData> {
  const [incomeSources, expenses] = await Promise.all([getIncomeSources(), getExpenses()]);

  const grossIncome = incomeSources.reduce((sum, source) => sum + Number(source.actual_income), 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const netIncome = grossIncome - totalExpense;
  const progressPercent = Math.max(0, Math.min((netIncome / TARGET_INCOME) * 100, 100));
  const gap = Math.max(TARGET_INCOME - netIncome, 0);

  return {
    targetIncome: TARGET_INCOME,
    grossIncome,
    totalExpense,
    netIncome,
    progressPercent,
    gap,
    incomeSummary: {
      count: incomeSources.length,
      totalExpected: incomeSources.reduce((sum, source) => sum + Number(source.expected_income), 0),
      totalActual: grossIncome
    },
    expenseSummary: {
      count: expenses.length,
      totalAmount: totalExpense
    }
  };
}

export async function getIncomeManagementData(): Promise<IncomeManagementPageData> {
  const incomeSources = await getIncomeSources();
  return { incomeSources };
}

export async function getExpenseManagementData(): Promise<ExpenseManagementPageData> {
  const expenses = await getExpenses();
  return { expenses };
}

export async function getMoneyPlanPageData(): Promise<MoneyPlanPageData> {
  const [incomeSources, expenses, plans] = await Promise.all([getIncomeSources(), getExpenses(), getMoneyGoalPlans()]);

  const grossIncome = incomeSources.reduce((sum, source) => sum + Number(source.actual_income), 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const currentNet = grossIncome - totalExpense;
  const plannedIncrease = plans
    .filter((plan) => ACTIVE_PLAN_STATUSES.includes(plan.status))
    .reduce((sum, plan) => sum + Number(plan.net_increase), 0);
  const projectedNet = currentNet + plannedIncrease;
  const remainingGap = Math.max(TARGET_INCOME - projectedNet, 0);

  return {
    targetIncome: TARGET_INCOME,
    currentNet,
    plannedIncrease,
    projectedNet,
    remainingGap,
    plans
  };
}


export async function getConstructionProgressData() {
  const [steps, updates] = await Promise.all([getConstructionSteps(), getStepUpdates()]);
  const latestByStepId = new Map<string, string>();

  updates.forEach((update) => {
    if (!latestByStepId.has(update.step_id)) {
      latestByStepId.set(update.step_id, update.message);
    }
  });

  return {
    steps: steps.map((step) => ({
      ...step,
      latest_update: latestByStepId.get(step.id) ?? step.latest_update,
      latest_update_text: step.latest_update_text ?? latestByStepId.get(step.id) ?? step.latest_update
    }))
  };
}
