import { LifeDirectionSummary } from '@/lib/dashboard/types';

type LifeDirectionCardProps = {
  summary: LifeDirectionSummary;
};

export function LifeDirectionCard({ summary }: LifeDirectionCardProps) {
  return (
    <section className="mission-card p-6 md:p-7">
      <div className="relative z-10">
        <p className="mission-label">CURRENT STATUS</p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <p className="text-5xl font-bold text-white">{summary.score}%</p>
          <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">{summary.status}</span>
        </div>
        <p className="body-text mt-3">{summary.interpretation}</p>
        <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-slate-950/70">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" style={{ width: `${summary.score}%` }} />
        </div>
      </div>
    </section>
  );
}
