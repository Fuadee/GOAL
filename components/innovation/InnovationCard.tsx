import Link from 'next/link';

import { getCurrentMissionFocus, getInnovationStateMeta } from '@/lib/innovation/helpers';
import { InnovationCardViewModel } from '@/lib/innovation/types';
import { innovationUi, statusBadge } from './uiTokens';

type InnovationCardProps = {
  innovation: InnovationCardViewModel;
  isCurrent?: boolean;
  compactCompleted?: boolean;
};


function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function InnovationCard({ innovation, isCurrent = false, compactCompleted = false }: InnovationCardProps) {
  const stateMeta = getInnovationStateMeta(innovation);
  const currentStep = getCurrentMissionFocus(innovation);

  if (compactCompleted) {
    return (
      <article className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{innovation.title}</h3>
          <span className={`${statusBadge.base} ${statusBadge.completed}`}>COMPLETED</span>
        </div>
        <p className="mt-1 text-xs text-slate-600">Updated {formatTimestamp(innovation.updated_at)}</p>
        <Link href={`/innovation/${innovation.id}`} className="mt-2 inline-flex text-xs font-semibold text-slate-700 underline underline-offset-2">Open details</Link>
      </article>
    );
  }

  return (
    <article className={`space-y-4 rounded-2xl border bg-white p-4 shadow-sm sm:space-y-3 ${isCurrent ? 'border-slate-900/15 bg-gradient-to-b from-white to-slate-50/80 shadow-[0_12px_30px_rgba(15,23,42,0.08)]' : 'border-slate-200'}`}>
      <header className="space-y-2.5">
        {isCurrent ? <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Current Execution</p> : null}
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-950 sm:text-base">{innovation.title}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{innovation.description || 'No description yet.'}</p>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {isCurrent ? <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">Active</span> : null}
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{stateMeta.label}</span>
        </div>
      </header>

      <div className="space-y-1 rounded-lg bg-slate-100/70 p-3">
        <p className="text-xs font-semibold text-slate-500">Next action</p>
        <p className="line-clamp-2 text-sm font-medium text-slate-900">{currentStep?.title ?? 'ยังไม่มีขั้นตอน'}</p>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-slate-700">Progress {innovation.progressPercent}% · {innovation.completedStepCount}/{innovation.stepTotal} steps</p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${innovation.progressPercent}%` }} />
        </div>
      </div>

      <div className="pt-1">
        <Link
          href={`/innovation/${innovation.id}`}
          className={`${innovationUi.primaryButton} h-12 w-full rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.99]`}
        >
          Open Mission
        </Link>
      </div>
    </article>
  );
}
