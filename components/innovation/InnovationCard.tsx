'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  addInnovationStepAction,
  blockInnovationAction,
  markInnovationNextStepDoneAction,
  resumeInnovationAction,
  updateInnovationBlockedReasonAction
} from '@/app/innovation/actions';
import { deriveInnovationState, getInnovationStateMeta } from '@/lib/innovation/helpers';
import { InnovationCardViewModel, InnovationDerivedState } from '@/lib/innovation/types';

type InnovationCardProps = {
  innovation: InnovationCardViewModel;
  isCurrent?: boolean;
};

const stateStyles: Record<InnovationDerivedState, string> = {
  idea: 'border border-slate-300 bg-slate-100 text-slate-700',
  building: 'border border-amber-300 bg-amber-100 text-amber-800',
  blocked: 'border border-rose-300 bg-rose-100 text-rose-800',
  completed: 'border border-emerald-300 bg-emerald-100 text-emerald-800'
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(value));
}

export function InnovationCard({ innovation, isCurrent = false }: InnovationCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [stepTitle, setStepTitle] = useState('');
  const [blockReason, setBlockReason] = useState(innovation.blocked_reason ?? '');
  const stateMeta = getInnovationStateMeta(innovation);
  const derivedState = deriveInnovationState(innovation);
  const isStepActionDisabled = isPending || !stepTitle.trim();
  const isBlockActionDisabled = isPending || !blockReason.trim();
  const [isBlockerFormOpen, setIsBlockerFormOpen] = useState(Boolean(innovation.blocked_reason));
  const visibleSteps = innovation.steps.slice(0, 2);
  const hasMoreSteps = innovation.steps.length > 2;

  const runAction = (runner: () => Promise<{ success: boolean; message: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await runner();
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  };

  return (
    <article className={`space-y-4 rounded-3xl border bg-slate-50/70 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition sm:p-5 ${isCurrent ? 'border-slate-300 ring-1 ring-slate-900/10' : 'border-slate-200'}`}>
      <header className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-xl font-bold leading-tight text-slate-900">{innovation.title}</h3>
          <div className="flex flex-wrap items-center gap-2">
            {isCurrent ? <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold tracking-wide text-white">CURRENT</span> : null}
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stateStyles[derivedState]}`}>{stateMeta.label}</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-slate-700">{innovation.description || 'No description yet.'}</p>
        <p className="text-xs text-slate-500">Updated {formatTimestamp(innovation.updated_at)}</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Next milestone</p>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-900">{innovation.nextStep?.title ?? 'ยังไม่มี step เริ่มจากเพิ่มขั้นตอนแรก'}</p>
      </section>

      <section className="grid grid-cols-2 gap-2 text-sm text-slate-600">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <p className="text-xs text-slate-500">Progress</p>
          <p className="mt-1 font-semibold text-slate-900">{innovation.progressPercent}%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <p className="text-xs text-slate-500">Steps</p>
          <p className="mt-1 font-semibold text-slate-900">{innovation.completedStepCount} / {innovation.stepTotal}</p>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Current step</p>
        {innovation.nextStep ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">{innovation.nextStep.title}</p>
            <button
              type="button"
              disabled={isPending || derivedState !== 'building'}
              onClick={() => runAction(() => markInnovationNextStepDoneAction(innovation.id))}
              className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              Mark Done
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">ยังไม่มี step ถัดไป</p>
        )}
      </section>

      <section className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-900">Add next step</h4>
        {(derivedState === 'idea' || derivedState === 'building') ? (
          <div className="grid gap-2 min-[430px]:grid-cols-[1fr_auto]">
            <input
              value={stepTitle}
              onChange={(event) => setStepTitle(event.target.value)}
              placeholder={derivedState === 'idea' ? 'เพิ่มขั้นตอนแรกที่ต้องทำ' : 'New step title'}
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              aria-label="New step title"
            />
            <button
              type="button"
              disabled={isStepActionDisabled}
              onClick={() => runAction(() => addInnovationStepAction(innovation.id, stepTitle))}
              className="h-11 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {derivedState === 'idea' ? 'Add First Step' : 'Add Step'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">สถานะปัจจุบันไม่สามารถเพิ่ม step ใหม่ได้</p>
        )}
      </section>

      <section className="space-y-2">
        {derivedState === 'blocked' ? (
          <div className="space-y-2 rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-sm font-semibold text-rose-900">Blocked</p>
            <p className="text-sm text-rose-800">{innovation.blocked_reason || 'Blocked without reason'}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={isPending} onClick={() => setIsBlockerFormOpen((v) => !v)} className="h-10 rounded-xl border border-rose-300 bg-white px-3 text-sm font-semibold text-rose-800">Edit reason</button>
              <button type="button" disabled={isPending} onClick={() => runAction(() => resumeInnovationAction(innovation.id))} className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800">Clear blocker</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setIsBlockerFormOpen((v) => !v)} className="text-sm font-semibold text-rose-700 underline-offset-2 hover:underline">ติดปัญหา? Report blocker</button>
        )}

        {isBlockerFormOpen ? (
          <div className="grid gap-2 min-[430px]:grid-cols-[1fr_auto]">
            <input value={blockReason} onChange={(event) => setBlockReason(event.target.value)} placeholder="ระบุสาเหตุที่ติด เช่น รอข้อมูล / รอคนอนุมัติ" className="h-11 rounded-xl border border-rose-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-900/10" aria-label="Blocked reason" />
            <button type="button" disabled={isBlockActionDisabled} onClick={() => runAction(() => (derivedState === 'blocked' ? updateInnovationBlockedReasonAction(innovation.id, blockReason) : blockInnovationAction(innovation.id, blockReason)))} className="h-11 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-200 disabled:text-rose-700">{derivedState === 'blocked' ? 'Update blocker' : 'Mark blocked'}</button>
          </div>
        ) : null}
      </section>

      {innovation.steps.length > 0 ? (
        <section className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-900">Existing steps</h4>
          <ul className="space-y-2">
            {visibleSteps.map((step) => {
              const isDone = step.status === 'done';
              const isCurrentStep = innovation.nextStep?.id === step.id;
              return (
                <li key={step.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm">
                  <div className="space-y-1">
                    <span className="text-slate-700">{step.title}</span>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{isDone ? '✓ Done' : 'Pending'}</span>
                    </div>
                  </div>
                  {!isDone && isCurrentStep && derivedState === 'building' ? <button type="button" disabled={isPending} onClick={() => runAction(() => markInnovationNextStepDoneAction(innovation.id))} className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800">Mark Done</button> : null}
                </li>
              );
            })}
          </ul>
          {hasMoreSteps ? <p className="text-xs text-slate-500">View all steps in Open details</p> : null}
        </section>
      ) : null}

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <Link href={`/innovation/${innovation.id}`} className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100">
        Open details
      </Link>
    </article>
  );
}
