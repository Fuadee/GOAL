import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Navbar } from '@/components/navbar';
import { SMV_DIMENSION_KEYS, SmvDimensionKey } from '@/lib/smv/types';
import { getSmvDimensionDetailByKey } from '@/lib/smv/service';

export default async function SmvDimensionPage({ params }: { params: { dimension: string } }) {
  const key = params.dimension as SmvDimensionKey;
  if (!SMV_DIMENSION_KEYS.includes(key)) notFound();

  const detail = await getSmvDimensionDetailByKey(key);
  if (!detail) notFound();

  return (
    <main className="app-shell">
      <Navbar />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 py-8 md:px-8">
        <Link href="/smv" className="text-sm text-cyan-200 hover:text-cyan-100">← Back to SMV overview</Link>
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-300">Dimension</p>
          <h1 className="text-3xl font-semibold text-white">{detail.overview.dimension.label}</h1>
          <p className="mt-2 text-4xl font-semibold text-cyan-100">{detail.overview.score.toFixed(1)}</p>
          <p className="mt-2 text-sm text-slate-300">{detail.overview.explanation}</p>
          <p className="mt-2 text-xs text-amber-200">{detail.overview.guardSummary}</p>
          <div className="mt-5">
            <Link
              href={`/smv/log?dimension=${detail.overview.dimension.key}`}
              className="inline-flex rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
            >
              Add Evidence
            </Link>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white">Score breakdown by metric</h2>
            <div className="mt-3 space-y-2">
              {detail.metrics.map((metric) => {
                const value = detail.breakdown[metric.key] ?? 0;
                return (
                  <div key={metric.id}>
                    <div className="mb-1 flex justify-between text-xs text-slate-300">
                      <span>{metric.label}</span>
                      <span>{value.toFixed(1)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white">Level definitions</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {detail.levelDefinitions.map((level) => (
                <li key={level.id} className="rounded-xl border border-white/10 bg-slate-950/30 p-3">
                  <p className="font-semibold">{level.level_score} • {level.title}</p>
                  <p className="text-xs text-slate-400">{level.requirement_text}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">Recent evidence logs</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              {detail.recentEvidence.map((evidence) => (
                <div key={evidence.id} className="rounded-xl border border-white/10 bg-slate-950/30 p-3">
                  <p>{new Date(evidence.logged_at).toLocaleString()}</p>
                  <p className="text-xs">{evidence.context ?? 'General'} {evidence.note ? `• ${evidence.note}` : ''}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">Score history</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              {detail.history.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-white/10 bg-slate-950/30 p-3">
                  <p className="font-medium text-white">{entry.score.toFixed(1)}</p>
                  <p className="text-xs">{new Date(entry.calculated_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold text-white">Improvement suggestions</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200">
            {detail.suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}
