import { getMoneyIncomeSources } from '@/lib/money/queries';
import { MoneyManagementPageData } from '@/lib/money/types';

export async function getMoneyManagementData(): Promise<MoneyManagementPageData> {
  try {
    const incomeSources = (await getMoneyIncomeSources()) ?? [];
    const summary = incomeSources.reduce(
    (acc, row) => {
      acc.grossIncome += Number(row.income_amount);
      acc.totalExpense += Number(row.expense_amount);
      return acc;
    },
    { grossIncome: 0, totalExpense: 0, netIncome: 0 }
  );
    summary.netIncome = summary.grossIncome - summary.totalExpense;

    return { incomeSources, summary };
  } catch (error) {
    console.error('[money-management load failed]', error);
    return {
      incomeSources: [],
      summary: { grossIncome: 0, totalExpense: 0, netIncome: 0 }
    };
  }
}
