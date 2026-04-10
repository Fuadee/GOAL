import Link from 'next/link';

import { Navbar } from '@/components/navbar';
import { getSmvOverviewData } from '@/lib/smv/service';

function Radar({ items }: { items: Awaited<ReturnType<typeof getSmvOverviewData>>['dimensions'] }) {
  const size = 360;
  const center = size / 2;
  const radius = 120;

  const points = items
    .map((item, index) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * index) / items.length;
      const r = (item.score / 100) * radius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-[340px] w-[340px]">
      {[25, 50, 75, 100].map((ring) => {
        const ringR = (ring / 100) * radius;
        const ringPoints = items
          .map((_, index) => {
            const angle = -Math.PI / 2 + (2 * Math.PI * index) / items.length;
            return `${center + ringR * Math.cos(angle)},${center + ringR * Math.sin(angle)}`;
          })
          .join(' ');
        return <polygon key={ring} points={ringPoints} fill="none" stroke="rgba(148,163,184,0.35)" />;
      })}
      <polygon points={points} fill="rgba(56,189,248,0.20)" stroke="rgba(125,211,252,0.9)" strokeWidth={2} />
    </svg>
  );
}

export default async function SmvOverviewPage() {
  const data = await getSmvOverviewData();

  return (
    <main className="app-shell">
      <Navbar />
      <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">SMV Module</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Evidence-based SMV System</h1>
          <p className="mt-2 text-sm text-slate-300">No manual score edits. Scores are calculated from evidence logs + metric guards.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/smv/log"
              className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
            >
              Add Evidence
            </Link>
            <Link
              href="/smv/plan"
              className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              Improvement Plan
            </Link>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">Average score</p>
            <p className="text-5xl font-semibold text-cyan-100">{data.averageScore}</p>
            <div className="mt-4 flex justify-center">
              <Radar items={data.dimensions} />
            </div>
          </article>

          <article className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-white">Dimension Cards</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {data.dimensions.map((item) => (
                <Link
                  key={item.dimension.id}
                  href={`/smv/${item.dimension.key}`}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition hover:border-cyan-300/40 hover:bg-slate-900/80"
                >
                  <p className="text-sm text-slate-300">{item.dimension.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{item.score.toFixed(1)}</p>
                  <p className="mt-2 text-xs text-slate-400">{item.guardSummary}</p>
                </Link>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <h3 className="font-semibold text-emerald-100">Strongest 3</h3>
            <ul className="mt-2 space-y-1 text-sm text-emerald-50">
              {data.strongest.map((item) => (
                <li key={item.dimension.id}>{item.dimension.label} • {item.score.toFixed(1)}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-4">
            <h3 className="font-semibold text-amber-100">Weakest 3</h3>
            <ul className="mt-2 space-y-1 text-sm text-amber-50">
              {data.weakest.map((item) => (
                <li key={item.dimension.id}>{item.dimension.label} • {item.score.toFixed(1)}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold text-white">Recommended Next Actions</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
              {data.recommendedActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold text-white">Latest Evidence Logs</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            {data.latestLogs.map((log) => (
              <p key={log.id}>{new Date(log.logged_at).toLocaleString()} • {log.context ?? 'General'} {log.note ? `• ${log.note}` : ''}</p>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
