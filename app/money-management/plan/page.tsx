import { MoneyPlanSystem } from '@/components/money-planner/MoneyPlanSystem';
import { Navbar } from '@/components/navbar';
import { getMoneyPlanPageData } from '@/lib/money/service';

export default async function MoneyManagementPlanPage() {
  const data = await getMoneyPlanPageData();

  return (
    <main className="app-shell">
      <Navbar />

      <section className="page-container space-y-8">
        <MoneyPlanSystem data={data} />
      </section>
    </main>
  );
}
