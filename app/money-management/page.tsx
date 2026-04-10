import { ConstructionProgressSection } from '@/components/money-planner/ConstructionProgressSection';
import { IncomePlanningSystem } from '@/components/money-planner/IncomePlanningSystem';
import { Navbar } from '@/components/navbar';
import { getConstructionProgressData, getMoneyDashboardData } from '@/lib/money/service';

export default async function MoneyManagementPage() {
  const [data, construction] = await Promise.all([getMoneyDashboardData(), getConstructionProgressData()]);

  return (
    <main className="app-shell">
      <Navbar />

      <section className="page-container space-y-10">
        <ConstructionProgressSection steps={construction.steps} />
        <IncomePlanningSystem data={data} />
      </section>
    </main>
  );
}
