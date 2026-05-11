import Link from 'next/link';

import { deriveInnovationState, getCurrentIncompleteStep, getInnovationStateMeta } from '@/lib/innovation/helpers';
import { InnovationCardViewModel, InnovationDerivedState } from '@/lib/innovation/types';
import { innovationUi, statusBadge } from './uiTokens';

type InnovationCardProps = {
  innovation: InnovationCardViewModel;
  isCurrent?: boolean;
  compactCompleted?: boolean;
};

const stateStyles: Record<InnovationDerivedState, string> = {
  idea: `${statusBadge.base} ${statusBadge.concept}`,
  building: `${statusBadge.base} ${statusBadge.building}`,
  blocked: 'border border-rose-300 bg-rose-100 text-rose-800',
  completed: `${statusBadge.base} ${statusBadge.completed}`
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function InnovationCard({ innovation, isCurrent = false, compactCompleted = false }: InnovationCardProps) {
  const derivedState = deriveInnovationState(innovation);
  const stateMeta = getInnovationStateMeta(innovation);
  const currentStep = getCurrentIncompleteStep(innovation);
  const hasCurrentStep = Boolean(currentStep);

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
    <article className={`space-y-3 rounded-2xl border bg-white p-4 shadow-sm ${isCurrent ? 'border-slate-900/20 bg-gradient-to-br from-white via-slate-50 to-cyan-50/40 shadow-[0_18px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/10' : 'border-slate-200'}`}>
      <header className="space-y-2">
        {isCurrent ? <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">Current Execution</p> : null}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold text-slate-950">{innovation.title}</h3>
          <div className="flex gap-1.5">
            {isCurrent ? <span className={`${statusBadge.base} ${statusBadge.current}`}>ACTIVE</span> : null}
            <span className={stateStyles[derivedState]}>{stateMeta.label}</span>
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-slate-700">{innovation.description || 'No description yet.'}</p>
      </header>

      <div className={`rounded-xl border p-3 ${isCurrent ? 'border-slate-900/20 bg-white' : 'border-slate-200'}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Current Work</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{currentStep?.title ?? 'ยังไม่มีงานย่อยที่กำลังทำ'}</p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
          <span>Progress</span>
          <span>{innovation.progressPercent}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${innovation.progressPercent}%` }} />
        </div>
        <p className="text-sm font-medium text-slate-700">{innovation.completedStepCount}/{innovation.stepTotal} steps completed</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Link href={hasCurrentStep ? `/innovation/${innovation.id}?focus=current-work` : `/innovation/${innovation.id}?focus=add-step`} className={innovationUi.primaryButton}>{hasCurrentStep ? 'Continue Working' : 'Add First Step'}</Link>
        <Link href={`/innovation/${innovation.id}`} className={innovationUi.secondaryButton}>Open Details</Link>
      </div>
    </article>
  );
}
