import { ConstructionProgressSection } from '@/components/money-planner/ConstructionProgressSection';
import { IncomePlanningSystem } from '@/components/money-planner/IncomePlanningSystem';
import { Navbar } from '@/components/navbar';
import { getConstructionProgressData, getMoneyDashboardData } from '@/lib/money/service';

export default async function MoneyManagementPage() {
  const [data, construction] = await Promise.all([getMoneyDashboardData(), getConstructionProgressData()]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 md:px-8 md:py-12">
        <ConstructionProgressSection steps={construction.steps} />
        <IncomePlanningSystem data={data} />
      </section>
    </main>
  );
}
