import { ConstructionExecutionState, ConstructionMetricView, ConstructionMilestoneView, ConstructionRiskLevel, ConstructionWaitingSummaryView } from '@/lib/money/types';

import { ConstructionMilestoneStepper } from './ConstructionMilestoneStepper';
import { ConstructionWaitingStatusCard } from './ConstructionWaitingStatusCard';

type Props = {
  statusLabel: string;
  progressPercent: number;
  metrics: ConstructionMetricView[];
  milestones: ConstructionMilestoneView[];
  waitingSummary: ConstructionWaitingSummaryView;
  executionState: ConstructionExecutionState | null;
  riskLevel: ConstructionRiskLevel | null;
  onToggleDetails: () => void;
  onAddUpdate: () => void;
  onMarkResponseReceived: () => void;
  onEditWaitingDetails: () => void;
  expanded: boolean;
};

function ProgressRing({ progressPercent }: { progressPercent: number }) {
  const clamped = Math.max(0, Math.min(progressPercent, 100));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" className="text-slate-700" fill="none" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.45)]"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{clamped}%</div>
    </div>
  );
}

export function ConstructionHeroCard({
  statusLabel,
  progressPercent,
  metrics,
  milestones,
  waitingSummary,
  executionState,
  riskLevel,
  onToggleDetails,
  onAddUpdate,
  onMarkResponseReceived,
  onEditWaitingDetails,
  expanded
}: Props) {
  return (
    <section className="rounded-3xl border border-cyan-300/20 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-5 shadow-2xl shadow-cyan-950/20 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">MAIN FINANCIAL PROJECT</p>
          <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Construction – Baan Na Teen</h2>
          <p className="mt-3 text-sm text-slate-300 md:text-base">12-unit rental house plan driving the path to 100K/month</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article key={metric.label} className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">{metric.label}</p>
                <p className="mt-1 text-base font-semibold text-slate-100">{metric.value}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
🏗 {statusLabel}
          </span>
          <ProgressRing progressPercent={progressPercent} />
          <button
            type="button"
            onClick={onToggleDetails}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
{expanded ? 'Hide full steps' : 'View all steps'} →
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <ConstructionMilestoneStepper milestones={milestones} />
        <ConstructionWaitingStatusCard
          summary={waitingSummary}
          executionState={executionState}
          riskLevel={riskLevel}
          onAddUpdate={onAddUpdate}
          onMarkResponseReceived={onMarkResponseReceived}
          onEditWaitingDetails={onEditWaitingDetails}
        />
      </div>
    </section>
  );
}
