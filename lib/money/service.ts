import { getExpenses, getIncomeSources, getRentalHouses } from '@/lib/money/queries';
import { MoneyDashboardData } from '@/lib/money/types';

const TARGET_INCOME = 100000;

export async function getMoneyDashboardData(): Promise<MoneyDashboardData> {
  const [incomeSources, expenses, rentalHouses] = await Promise.all([getIncomeSources(), getExpenses(), getRentalHouses()]);

  const totalIncome = incomeSources.reduce((sum, source) => sum + Number(source.actual_income), 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const netIncome = totalIncome - totalExpense;
  const progressPercent = totalIncome <= 0 ? 0 : (totalIncome / TARGET_INCOME) * 100;
  const gap = TARGET_INCOME - totalIncome;

  return {
    targetIncome: TARGET_INCOME,
    totalIncome,
    totalExpense,
    netIncome,
    progressPercent,
    gap,
    incomeSources,
    expenses,
    rentalHouses
  };
}
