import { LifeDirectionSummary } from '@/lib/dashboard/types';

type LifeDirectionCardProps = {
  summary: LifeDirectionSummary;
};

export function LifeDirectionCard({ summary }: LifeDirectionCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30 md:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Life Direction Score</p>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <p className="text-5xl font-semibold text-white">{summary.score}%</p>
        <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
          {summary.status}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-300">{summary.interpretation}</p>
      <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400"
          style={{ width: `${summary.score}%` }}
        />
      </div>
    </section>
  );
}
