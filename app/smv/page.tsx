import { Navbar } from '@/components/navbar';
import { SmvDashboardClient } from '@/components/smv/SmvDashboardClient';
import { getSmvDashboardData } from '@/lib/smv/service';

export default async function SmvPage() {
  const data = await getSmvDashboardData();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <section className="mx-auto w-full max-w-7xl px-4 pt-10 md:px-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">SMV Analytics</p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">SMV Scoring System</h1>
          <p className="max-w-2xl text-base text-slate-300">
            Checklist-driven scoring for all 8 SMV dimensions with trend tracking, strongest/weakest highlights, and score history.
          </p>
        </header>
      </section>
      <SmvDashboardClient data={data} />
    </main>
  );
}
