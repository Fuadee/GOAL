import { Navbar } from '@/components/navbar';
import { RunnerQuestDashboard } from '@/components/health/RunnerQuestDashboard';
import { getRunnerDashboardData } from '@/lib/running/quest.server';

export default async function HealthPage() {
  const dashboard = await getRunnerDashboardData();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 md:px-8 md:py-14">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Health Dashboard</p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">Runner Quest Control Panel</h1>
          <p className="text-base text-slate-300">Track every run, pass levels by performance, and unlock the full 5 km progression.</p>
        </header>

        <RunnerQuestDashboard data={dashboard} />
      </section>
    </main>
  );
}
