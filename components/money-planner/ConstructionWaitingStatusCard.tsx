import { ConstructionExecutionState, ConstructionRiskLevel, ConstructionWaitingSummaryView } from '@/lib/money/types';

type Props = {
  summary: ConstructionWaitingSummaryView;
  executionState: ConstructionExecutionState | null;
  riskLevel: ConstructionRiskLevel | null;
  showControls?: boolean;
  onAddUpdate?: () => void;
  onMarkResponseReceived?: () => void;
  onEditWaitingDetails?: () => void;
};

const EXECUTION_STYLES: Record<ConstructionExecutionState, string> = {
  doing: 'border-cyan-300/50 bg-cyan-500/15 text-cyan-100',
  waiting: 'border-amber-300/50 bg-amber-500/15 text-amber-100',
  blocked: 'border-rose-400/60 bg-rose-500/20 text-rose-100',
  follow_up_needed: 'border-violet-300/50 bg-violet-500/15 text-violet-100'
};

const EXECUTION_LABELS: Record<ConstructionExecutionState, string> = {
  doing: 'Doing',
  waiting: 'Waiting',
  blocked: 'Blocked',
  follow_up_needed: 'Follow-up Needed'
};

const RISK_LABELS: Record<ConstructionRiskLevel, string> = {
  on_track: 'On track',
  delayed: 'Delayed',
  urgent: 'Urgent'
};

const RISK_STYLES: Record<ConstructionRiskLevel, string> = {
  on_track: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100',
  delayed: 'border-amber-300/50 bg-amber-500/15 text-amber-100',
  urgent: 'border-rose-400/60 bg-rose-500/20 text-rose-100'
};

export function ConstructionWaitingStatusCard({
  summary,
  executionState,
  riskLevel,
  showControls = true,
  onAddUpdate,
  onMarkResponseReceived,
  onEditWaitingDetails
}: Props) {
  const highlighted = executionState === 'waiting' || executionState === 'blocked';

  return (
    <aside
      className={`rounded-2xl border p-4 ${
        highlighted
          ? 'border-amber-300/45 bg-gradient-to-b from-amber-400/15 via-slate-900/95 to-slate-950 shadow-[0_0_35px_rgba(245,158,11,0.25)]'
          : 'border-cyan-300/25 bg-gradient-to-b from-cyan-500/10 to-slate-950/70'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200/80">Current Waiting Status</p>
      <h4 className="mt-2 text-lg font-semibold text-white">Mission Control</h4>

      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            executionState ? EXECUTION_STYLES[executionState] : 'border-slate-500/50 bg-slate-800 text-slate-100'
          }`}
        >
          Real status: {executionState ? EXECUTION_LABELS[executionState] : 'Unknown'}
        </span>
        {riskLevel ? <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${RISK_STYLES[riskLevel]}`}>Risk: {RISK_LABELS[riskLevel]}</span> : null}
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Current step</dt>
          <dd className="font-medium text-slate-100">{summary.currentStep}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Waiting on</dt>
          <dd className="font-medium text-slate-100">{summary.waitingOn}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Since</dt>
          <dd className="font-medium text-slate-100">{summary.waitingSince}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Expected by</dt>
          <dd className="font-medium text-slate-100">{summary.expectedBy}</dd>
        </div>
      </dl>

      <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
        Next move: <span className="text-slate-50">{summary.nextAction}</span>
      </p>
      <p className="mt-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
        Latest update: <span className="text-slate-50">{summary.latestUpdate}</span>
      </p>

      {showControls ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onAddUpdate} className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10">
            Add update
          </button>
          <button type="button" onClick={onMarkResponseReceived} className="rounded-full border border-emerald-400/40 px-3 py-1 text-xs text-emerald-200 transition hover:bg-emerald-500/15">
            Mark response received
          </button>
          <button type="button" onClick={onEditWaitingDetails} className="rounded-full border border-cyan-300/40 px-3 py-1 text-xs text-cyan-100 transition hover:bg-cyan-500/15">
            Edit waiting details
          </button>
        </div>
      ) : null}
    </aside>
  );
}
