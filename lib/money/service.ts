import { getAssetMonthlySnapshots, getGrowthAssets, getMoneyIncomeSources } from '@/lib/money/queries';
import { MoneyManagementPageData } from '@/lib/money/types';

export async function getMoneyManagementData(): Promise<MoneyManagementPageData> {
  try {
    const incomeSources = (await getMoneyIncomeSources()) ?? [];
    const growthAssets = (await getGrowthAssets()) ?? [];
    const assetSnapshots = (await getAssetMonthlySnapshots()) ?? [];

    const summary = incomeSources.reduce(
      (acc, row) => {
        acc.grossIncome += Number(row.income_amount);
        acc.totalExpense += Number(row.expense_amount);
        return acc;
      },
      { grossIncome: 0, totalExpense: 0, netIncome: 0 }
    );
    summary.netIncome = summary.grossIncome - summary.totalExpense;

    const growthSummary = growthAssets.reduce(
      (acc, row) => {
        acc.totalValue += Number(row.current_value);
        acc.totalProfitLoss += Number(row.profit_loss);
        acc.totalInvested += Number(row.invested_amount);
        return acc;
      },
      { totalValue: 0, totalProfitLoss: 0, totalInvested: 0, totalReturnPercent: 0 }
    );

    growthSummary.totalReturnPercent =
      growthSummary.totalInvested > 0
        ? (growthSummary.totalProfitLoss / growthSummary.totalInvested) * 100
        : 0;

    return { incomeSources, growthAssets, assetSnapshots, summary, growthSummary };
  } catch (error) {
    console.error('[money-management load failed]', error);
    return {
      incomeSources: [],
      growthAssets: [],
      assetSnapshots: [],
      summary: { grossIncome: 0, totalExpense: 0, netIncome: 0 },
      growthSummary: { totalValue: 0, totalProfitLoss: 0, totalInvested: 0, totalReturnPercent: 0 }
    };
  }
}
