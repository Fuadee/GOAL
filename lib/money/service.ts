import { getExpenses, getIncomeSources, getRentalHouses } from '@/lib/money/queries';
import { MoneyDashboardData } from '@/lib/money/types';

const TARGET_INCOME = 100000;

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
