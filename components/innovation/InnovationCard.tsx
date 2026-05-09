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
    <article className={`space-y-5 rounded-3xl border bg-slate-50/40 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition sm:p-6 ${isCurrent ? 'border-slate-300 ring-1 ring-slate-900/10' : 'border-slate-200'}`}>
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-xl font-bold leading-tight text-slate-900">{innovation.title}</h3>
          <div className="flex flex-wrap items-center gap-2">
            {isCurrent ? <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold tracking-wide text-white">CURRENT</span> : null}
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stateStyles[derivedState]}`}>{stateMeta.label}</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-slate-700">{innovation.description || 'No description yet.'}</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Next milestone</p>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-900">{innovation.nextStep?.title ?? 'ยังไม่มี step เริ่มจากเพิ่มขั้นตอนแรก'}</p>
      </section>

      <section className="grid grid-cols-2 gap-3 text-sm text-slate-600 min-[390px]:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">Progress</p>
          <p className="mt-1 font-semibold text-slate-900">{innovation.progressPercent}%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">Steps</p>
          <p className="mt-1 font-semibold text-slate-900">{innovation.completedStepCount} / {innovation.stepTotal}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 col-span-2 min-[390px]:col-span-1">
          <p className="text-xs text-slate-500">Updated</p>
          <p className="mt-1 font-semibold text-slate-900">{formatTimestamp(innovation.updated_at)}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">Add next step</h4>
        {(derivedState === 'idea' || derivedState === 'building') ? (
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
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

        {derivedState === 'building' ? (
          <button
            type="button"
            disabled={isPending || !innovation.nextStep}
            onClick={() => runAction(() => markInnovationNextStepDoneAction(innovation.id))}
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Mark Next Step Done
          </button>
        ) : null}
      </section>

      <section className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
        <h4 className="text-sm font-semibold text-rose-900">Blocker</h4>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            value={blockReason}
            onChange={(event) => setBlockReason(event.target.value)}
            placeholder="ระบุสาเหตุที่ติด เช่น รอข้อมูล / รอคนอนุมัติ"
            className="h-11 rounded-xl border border-rose-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-900/10"
            aria-label="Blocked reason"
          />
          {derivedState !== 'blocked' ? (
            <button
              type="button"
              disabled={isBlockActionDisabled}
              onClick={() => runAction(() => blockInnovationAction(innovation.id, blockReason))}
              className="h-11 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-200 disabled:text-rose-700"
            >
              Mark Blocked
            </button>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={() => runAction(() => updateInnovationBlockedReasonAction(innovation.id, blockReason))}
              className="h-11 rounded-xl border border-rose-300 bg-white px-4 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Update Blocker
            </button>
          )}
        </div>
        {derivedState === 'blocked' ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => runAction(() => resumeInnovationAction(innovation.id))}
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear Blocker
          </button>
        ) : null}
      </section>

      {innovation.steps.length > 0 ? (
        <section className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-900">Existing steps</h4>
          <ul className="space-y-2">
            {innovation.steps.slice(0, 4).map((step) => {
              const isDone = step.status === 'done';
              return (
                <li key={step.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm">
                  <span className="text-slate-700">{step.title}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                    {isDone ? 'Done' : 'Pending'}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <Link href={`/innovation/${innovation.id}`} className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100">
        Open details
      </Link>
    </article>
  );
}
