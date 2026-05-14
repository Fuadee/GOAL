import { ConstructionProgressSection } from '@/components/money-planner/ConstructionProgressSection';
import { IncomePlanningSystem } from '@/components/money-planner/IncomePlanningSystem';
import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';
import { getConstructionProgressData, getMoneyDashboardData } from '@/lib/money/service';

export default async function MoneyManagementPage() {
  const [data, construction] = await Promise.all([getMoneyDashboardData(), getConstructionProgressData()]);

  return (
    <PageShell>
      <Navbar />
      <section className="page-container space-y-5 pt-2 md:pt-3">
        <ConstructionProgressSection steps={construction.steps} />
        <IncomePlanningSystem data={data} />
      </section>
    </PageShell>
  );
}
