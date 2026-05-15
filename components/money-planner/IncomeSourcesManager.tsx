import { IncomeSourceRow } from '@/lib/money/types';
import { MonthlyNetIncomeSystem } from './MonthlyNetIncomeSystem';

export function IncomeSourcesManager({ incomeSources }: { incomeSources: IncomeSourceRow[] }) {
  return <MonthlyNetIncomeSystem incomeSources={incomeSources} />;
}
