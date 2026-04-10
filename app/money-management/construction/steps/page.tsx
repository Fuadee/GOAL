import { Navbar } from '@/components/navbar';
import { ConstructionStepsManagerSection } from '@/components/money-planner/ConstructionStepsManagerSection';
import { getConstructionProgressData } from '@/lib/money/service';

export default async function ConstructionStepsManagementPage() {
  const construction = await getConstructionProgressData();

  return (
    <main className="app-shell">
      <Navbar />

      <section className="page-container space-y-10">
        <ConstructionStepsManagerSection steps={construction.steps} />
      </section>
    </main>
  );
}
