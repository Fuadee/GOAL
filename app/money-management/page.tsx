import { MonthlyNetIncomeSystem } from '@/components/money-planner/MonthlyNetIncomeSystem';
import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';
import { getIncomeManagementData } from '@/lib/money/service';

export default async function MoneyManagementPage() {
  const data = await getIncomeManagementData();

  return (
    <PageShell>
      <Navbar />
      <section className="page-container space-y-5 pt-2 md:pt-3">
        <MonthlyNetIncomeSystem incomeSources={data.incomeSources} />
      </section>
    </PageShell>
  );
}
