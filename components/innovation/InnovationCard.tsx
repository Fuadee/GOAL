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
  idea: 'bg-slate-500/20 text-slate-300 border border-slate-400/30',
  building: 'bg-amber-500/20 text-amber-300 border border-amber-400/40',
  blocked: 'bg-rose-500/20 text-rose-300 border border-rose-400/40',
  completed: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
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
    <article className={`space-y-4 rounded-2xl border bg-white/5 p-5 backdrop-blur transition duration-300 hover:scale-[1.01] ${isCurrent ? 'border-amber-300/50 shadow-[0_0_25px_rgba(251,191,36,0.2)]' : 'border-white/10 hover:border-white/20'}`}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-white">{innovation.title}</h3>
          <div className="flex items-center gap-2">
            {isCurrent ? <span className="rounded-full bg-amber-400/30 px-2 py-1 text-[10px] font-bold text-amber-100">CURRENT 🔥</span> : null}
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${stateStyles[derivedState]}`}>{stateMeta.label}</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">{innovation.description || 'No description yet.'}</p>
        <p className="text-xs text-slate-300">{stateMeta.description}</p>
        {innovation.is_blocked && innovation.blocked_reason ? (
          <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">Blocked reason: {innovation.blocked_reason}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 sm:grid-cols-3">
        <div>
          <p className="text-slate-400">Progress</p>
          <p className="font-semibold text-white">{innovation.progressPercent}%</p>
        </div>
        <div>
          <p className="text-slate-400">Steps</p>
          <p className="font-semibold text-white">{innovation.completedStepCount} / {innovation.stepTotal}</p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-slate-400">Updated</p>
          <p className="font-semibold text-white">{formatTimestamp(innovation.updated_at)}</p>
        </div>
      </div>

      <p className="text-sm text-slate-200">
        Next: <span className="font-semibold text-white">→ {innovation.nextStep?.title ?? 'No pending step'}</span>
      </p>

      <div className="space-y-2">
        {(derivedState === 'idea' || derivedState === 'building') ? (
          <div className="flex gap-2">
            <input
              value={stepTitle}
              onChange={(event) => setStepTitle(event.target.value)}
              placeholder={derivedState === 'idea' ? 'First step title' : 'New step title'}
              className="flex-1 rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-xs text-white"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => runAction(() => addInnovationStepAction(innovation.id, stepTitle))}
              className="rounded-full bg-indigo-400/20 px-3 py-2 text-xs font-semibold text-indigo-200 disabled:opacity-50"
            >
              {derivedState === 'idea' ? 'Add First Step' : 'Add Step'}
            </button>
          </div>
        ) : null}

        {derivedState === 'building' ? (
          <button
            type="button"
            disabled={isPending || !innovation.nextStep}
            onClick={() => runAction(() => markInnovationNextStepDoneAction(innovation.id))}
            className="rounded-full bg-emerald-400/20 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:opacity-50"
          >
            Mark Next Step Done
          </button>
        ) : null}

        {derivedState !== 'blocked' ? (
          <div className="flex gap-2">
            <input
              value={blockReason}
              onChange={(event) => setBlockReason(event.target.value)}
              placeholder="Blocked reason"
              className="flex-1 rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-xs text-white"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => runAction(() => blockInnovationAction(innovation.id, blockReason))}
              className="rounded-full bg-rose-400/20 px-3 py-2 text-xs font-semibold text-rose-100 disabled:opacity-50"
            >
              Block
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => runAction(() => resumeInnovationAction(innovation.id))}
              className="rounded-full bg-emerald-400/20 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:opacity-50"
            >
              Resume
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => runAction(() => updateInnovationBlockedReasonAction(innovation.id, blockReason))}
              className="rounded-full bg-rose-400/20 px-3 py-2 text-xs font-semibold text-rose-100 disabled:opacity-50"
            >
              Edit Block Reason
            </button>
          </div>
        )}

        {error ? <p className="text-xs text-rose-200">{error}</p> : null}
      </div>

      <Link href={`/innovation/${innovation.id}`} className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
        Open details
      </Link>
    </article>
  );
}
