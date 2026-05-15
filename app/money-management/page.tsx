import { ConstructionProgressSection } from '@/components/money-planner/ConstructionProgressSection';
import { IncomePlanningSystem } from '@/components/money-planner/IncomePlanningSystem';
import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';
import { getConstructionProgressData, getMoneyDashboardData } from '@/lib/money/service';

export default async function MoneyManagementPage() {
  try {
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
  } catch {
    return (
      <PageShell>
        <Navbar />
        <section className="page-container space-y-5 pt-2 md:pt-3">
          <article className="theme-card border border-rose-400/30 bg-rose-500/10 p-5">
            <h2 className="section-title text-rose-100">Money data unavailable</h2>
            <p className="helper-text text-rose-200/90">We could not load income data right now. Please refresh and try again.</p>
          </article>
        </section>
      </PageShell>
    );
  }
}
