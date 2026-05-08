import { ConstructionWaitingSummaryView } from '@/lib/money/types';

type Props = {
  summary: ConstructionWaitingSummaryView;
  showControls?: boolean;
  onAddUpdate?: () => void;
  onMarkResponseReceived?: () => void;
  onEditWaitingDetails?: () => void;
};

export function ConstructionWaitingStatusCard({
  summary,
  showControls = true,
  onAddUpdate,
  onMarkResponseReceived,
  onEditWaitingDetails
}: Props) {
  return (
    <aside className="rounded-2xl border border-cyan-300/25 bg-gradient-to-b from-cyan-500/10 to-slate-950/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200/80">Current Waiting Status</p>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Current step</dt>
          <dd className="font-medium text-slate-100">{summary.currentStep}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Waiting on</dt>
          <dd className="font-medium text-slate-100">{summary.waitingOn}</dd>
        </div>
      </dl>

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
