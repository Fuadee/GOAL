import { Navbar } from '@/components/navbar';
import { SmvEvidenceForm } from '@/components/smv/SmvEvidenceForm';
import { getSmvLogPageData } from '@/lib/smv/service';

export default async function SmvLogPage({ searchParams }: { searchParams?: { dimension?: string } }) {
  const data = await getSmvLogPageData();
  const requestedDimensionKey = searchParams?.dimension;
  const preselectedDimensionId =
    data.dimensions.find((dimension) => dimension.key === requestedDimensionKey)?.id ?? data.dimensions[0]?.id ?? '';

  return (
    <main className="app-shell">
      <Navbar />
      <section className="mx-auto w-full max-w-5xl space-y-5 px-4 py-8 md:px-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Evidence Logging</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">/smv/log</h1>
          <p className="mt-2 text-sm text-slate-300">This page logs evidence only. Core scores are recalculated automatically.</p>
        </header>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <SmvEvidenceForm
            dimensions={data.dimensions}
            metricsByDimension={data.metricsByDimension}
            initialDimensionId={preselectedDimensionId}
          />
        </article>
      </section>
    </main>
  );
}
