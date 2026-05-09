import Link from 'next/link';

import { deriveInnovationState, getInnovationStateMeta } from '@/lib/innovation/helpers';
import { InnovationCardViewModel, InnovationDerivedState } from '@/lib/innovation/types';

type InnovationCardProps = {
  innovation: InnovationCardViewModel;
  isCurrent?: boolean;
  compactCompleted?: boolean;
};

const stateStyles: Record<InnovationDerivedState, string> = {
  idea: 'border border-slate-300 bg-slate-100 text-slate-700',
  building: 'border border-amber-300 bg-amber-100 text-amber-800',
  blocked: 'border border-rose-300 bg-rose-100 text-rose-800',
  completed: 'border border-emerald-300 bg-emerald-100 text-emerald-800'
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function InnovationCard({ innovation, isCurrent = false, compactCompleted = false }: InnovationCardProps) {
  const derivedState = deriveInnovationState(innovation);
  const stateMeta = getInnovationStateMeta(innovation);

  if (compactCompleted) {
    return (
      <article className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{innovation.title}</h3>
          <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">COMPLETED</span>
        </div>
        <p className="mt-1 text-xs text-slate-600">Updated {formatTimestamp(innovation.updated_at)}</p>
        <Link href={`/innovation/${innovation.id}`} className="mt-2 inline-flex text-xs font-semibold text-slate-700 underline underline-offset-2">Open details</Link>
      </article>
    );
  }

  return (
    <article className={`space-y-3 rounded-2xl border bg-white p-4 shadow-sm ${isCurrent ? 'border-slate-300 ring-1 ring-slate-900/5' : 'border-slate-200'}`}>
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold text-slate-950">{innovation.title}</h3>
          <div className="flex gap-1.5">
            {isCurrent ? <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-bold text-white">CURRENT</span> : null}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${stateStyles[derivedState]}`}>{stateMeta.label}</span>
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-slate-700">{innovation.description || 'No description yet.'}</p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Next Milestone</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{innovation.nextStep?.title ?? 'ยังไม่มี step เริ่มจากเพิ่มขั้นตอนแรก'}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-slate-200 p-2">
          <p className="text-xs text-slate-500">Progress</p>
          <p className="text-sm font-semibold text-slate-900">{innovation.progressPercent}%</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-2">
          <p className="text-xs text-slate-500">Steps</p>
          <p className="text-sm font-semibold text-slate-900">{innovation.completedStepCount} / {innovation.stepTotal}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Current Step</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{innovation.nextStep?.title ?? 'ยังไม่มี step ถัดไป'}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href={`/innovation/${innovation.id}`} className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">Continue</Link>
        <Link href={`/innovation/${innovation.id}`} className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-800">Open details</Link>
      </div>
    </article>
  );
}
