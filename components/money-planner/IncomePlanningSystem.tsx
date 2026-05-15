import { MonthlyNetIncomeSystem } from './MonthlyNetIncomeSystem';
import { MoneyDashboardData } from '@/lib/money/types';

type Props = { data: MoneyDashboardData };

export function IncomePlanningSystem({ data }: Props) {
  return <MonthlyNetIncomeSystem incomeSources={data.incomeSources} />;
}
