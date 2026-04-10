import { Navbar } from '@/components/navbar';
import { RunnerQuestDashboard } from '@/components/health/RunnerQuestDashboard';
import { getRunnerDashboardData } from '@/lib/running/quest.server';

export default async function HealthPage() {
  const dashboard = await getRunnerDashboardData();

  return (
    <main className="app-shell">
      <Navbar />

      <section className="page-container space-y-8">
        <header className="page-header">
          <p className="page-kicker">Health Dashboard</p>
          <h1 className="page-title">Runner Quest Control Panel</h1>
          <p className="text-base text-[color:var(--text-secondary)]">Track every run, pass levels by performance, and unlock the full 5 km progression.</p>
        </header>

        <RunnerQuestDashboard data={dashboard} />
      </section>
    </main>
  );
}
