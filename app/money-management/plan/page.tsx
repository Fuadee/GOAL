import { MoneyPlanSystem } from '@/components/money-planner/MoneyPlanSystem';
import { Navbar } from '@/components/navbar';
import { getMoneyPlanPageData } from '@/lib/money/service';

export default async function MoneyManagementPlanPage() {
  const data = await getMoneyPlanPageData();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 md:px-8 md:py-14">
        <MoneyPlanSystem data={data} />
      </section>
    </main>
  );
}
