import { getExpenses, getIncomeSources, getMoneyGoalPlans, getRentalHouses } from '@/lib/money/queries';
import { MoneyDashboardData, MoneyGoalPlanStatus, MoneyPlanPageData } from '@/lib/money/types';

const TARGET_INCOME = 100000;
const ACTIVE_PLAN_STATUSES: MoneyGoalPlanStatus[] = ['planned', 'in_progress', 'completed'];

export async function getMoneyDashboardData(): Promise<MoneyDashboardData> {
  const [incomeSources, expenses, rentalHouses] = await Promise.all([getIncomeSources(), getExpenses(), getRentalHouses()]);

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
    incomeSources,
    expenses,
    rentalHouses
  };
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
