import { ConstructionFocusView } from '@/lib/money/types';

type Props = {
  focus: ConstructionFocusView;
};

export function ConstructionFocusPanel({ focus }: Props) {
  return (
    <aside className="rounded-2xl border border-cyan-300/25 bg-gradient-to-b from-cyan-500/10 to-slate-950/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200/80">Current Focus</p>
      <h4 className="mt-2 text-lg font-semibold text-white">Now Working On</h4>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Current step</dt>
          <dd className="font-medium text-slate-100">{focus.currentStep}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Progress</dt>
          <dd className="font-medium text-cyan-200">{focus.progressLabel}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Next milestone</dt>
          <dd className="font-medium text-slate-100">{focus.nextMilestone}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Expected by</dt>
          <dd className="font-medium text-slate-100">{focus.expectedByLabel}</dd>
        </div>
      </dl>

      <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
        Latest update: <span className="text-slate-50">{focus.latestUpdate}</span>
      </p>
    </aside>
  );
}
