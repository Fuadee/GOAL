import { AddInnovationForm } from '@/components/innovation/AddInnovationForm';
import { InnovationCard } from '@/components/innovation/InnovationCard';
import { ProgressBar } from '@/components/innovation/ProgressBar';
import { Navbar } from '@/components/navbar';
import { getInnovationDashboardData } from '@/lib/innovation/service';

const TARGET_INNOVATIONS = 10;

export default async function InnovationPage() {
  const innovations = await getInnovationDashboardData();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto w-full max-w-6xl space-y-8 px-6 py-16 md:px-10 md:py-20">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Innovation Dashboard</p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">Innovation System</h1>
          <p className="text-base text-slate-300 md:text-lg">Build 10 innovations to unlock your potential</p>
        </header>

        <ProgressBar current={innovations.length} total={TARGET_INNOVATIONS} />

        <AddInnovationForm currentCount={innovations.length} maxCount={TARGET_INNOVATIONS} />

        {innovations.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center backdrop-blur">
            <p className="text-slate-300">No innovation yet. Start building your future.</p>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2">
            {innovations.map((innovation) => (
              <InnovationCard key={innovation.id} innovation={innovation} />
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
