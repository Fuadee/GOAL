import { Navbar } from '@/components/navbar';
import { SmvDashboardClient } from '@/components/smv/SmvDashboardClient';
import { getSmvDashboardData } from '@/lib/smv/service';

export default async function SmvPage() {
  const data = await getSmvDashboardData();

  return (
    <main className="app-shell">
      <Navbar />
      <section className="page-container pb-2">
        <header className="page-header">
          <p className="page-kicker">SMV Analytics</p>
          <h1 className="page-title">SMV Scoring System</h1>
          <p className="max-w-2xl text-base text-[color:var(--text-secondary)]">
            Checklist-driven scoring for all 8 SMV dimensions with trend tracking, strongest/weakest highlights, and score history.
          </p>
        </header>
      </section>
      <SmvDashboardClient data={data} />
    </main>
  );
}
