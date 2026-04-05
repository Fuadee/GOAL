import { HealthLevelsSection } from '@/components/health/HealthLevelsSection';
import { Navbar } from '@/components/navbar';

export default function HealthPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto w-full max-w-6xl space-y-8 px-6 py-16 md:px-10 md:py-20">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Health Dashboard</p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">Health Progress</h1>
          <p className="text-base text-slate-300 md:text-lg">Build your body step by step</p>
        </header>

        <HealthLevelsSection />
      </section>
    </main>
  );
}
