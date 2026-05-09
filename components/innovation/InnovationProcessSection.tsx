'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import {
  createInnovationProcessStepAction,
  markStepAsDoneAction,
  markStepInProgressAction
} from '@/app/innovation/[id]/actions';
import { InnovationProcessStepSummary, InnovationStepStatus } from '@/lib/innovation/types';

type InnovationProcessSectionProps = {
  innovationId: string;
  currentStep: InnovationProcessStepSummary | null;
  nextStep: InnovationProcessStepSummary | null;
  upcomingSteps: InnovationProcessStepSummary[];
  completedSteps: InnovationProcessStepSummary[];
};

const stepStatusStyles: Record<InnovationStepStatus, string> = {
  todo: 'bg-slate-500/20 text-slate-200 border border-slate-400/30',
  in_progress: 'bg-amber-500/20 text-amber-200 border border-amber-400/40',
  done: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
};

export function InnovationProcessSection({ innovationId, currentStep, nextStep, upcomingSteps, completedSteps }: InnovationProcessSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const focusStep = currentStep ?? nextStep;

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="space-y-4 rounded-2xl border border-cyan-200/30 bg-slate-900/80 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Current Step</h2>
        {!focusStep ? (
          <div className="space-y-3">
            <p className="text-slate-200">ยังไม่มี step สำหรับ mission นี้</p>
            <a href="#add-step" className="inline-flex rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">Add First Step</a>
          </div>
        ) : (
          <article className="space-y-3">
            <p className="text-lg font-semibold text-white">{focusStep.title}</p>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stepStatusStyles[focusStep.status]}`}>
              {focusStep.status === 'done' ? 'COMPLETED' : focusStep.status === 'in_progress' ? 'IN PROGRESS' : 'TODO'}
            </span>
            <div>
              {focusStep.status === 'todo' ? (
                <button type="button" onClick={() => startTransition(async () => { await markStepInProgressAction(innovationId, focusStep.id); router.refresh(); })} className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white">Start Step</button>
              ) : null}
              {focusStep.status === 'in_progress' ? (
                <button type="button" onClick={() => startTransition(async () => { await markStepAsDoneAction(innovationId, focusStep.id); router.refresh(); })} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">Mark Complete</button>
              ) : null}
              {focusStep.status === 'done' ? <p className="text-sm text-emerald-200">✓ Completed</p> : null}
            </div>
          </article>
        )}
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Step Queue</h3>

        <details id="add-step" className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">+ Add Step</summary>
          <form
            action={(formData) => {
              setError(null);
              startTransition(async () => {
                const result = await createInnovationProcessStepAction(innovationId, formData);
                if (!result.success) {
                  setError(result.message);
                  return;
                }
                router.refresh();
              });
            }}
            className="mt-3 grid gap-3"
          >
            <input name="title" type="text" required placeholder="Step title" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300" />
            <textarea name="description" rows={2} placeholder="Step description" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300" />
            <input name="due_date" type="date" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300" />
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <button type="submit" disabled={isPending} className="w-fit rounded-full bg-indigo-400/20 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-400/30 disabled:opacity-50">{isPending ? 'Saving...' : 'Save'}</button>
          </form>
        </details>

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Upcoming Steps</p>
          {upcomingSteps.length === 0 ? <p className="text-sm text-slate-400">No upcoming todo steps.</p> : (
            <ul className="space-y-2">
              {upcomingSteps.map((step) => (
                <li key={step.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/40 p-3">
                  <span className="text-sm text-slate-100">{step.title}</span>
                  <button type="button" onClick={() => startTransition(async () => { await markStepInProgressAction(innovationId, step.id); router.refresh(); })} className="rounded-full bg-amber-400/20 px-3 py-1 text-xs text-amber-100">Start</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <details className="rounded-xl border border-white/10 bg-slate-900/30 p-4">
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Completed Steps ({completedSteps.length})</summary>
          <ul className="mt-3 space-y-2">
            {completedSteps.map((step) => (
              <li key={step.id} className="rounded-lg border border-white/10 bg-slate-900/30 p-3 text-sm text-slate-400">✓ {step.title}</li>
            ))}
          </ul>
        </details>
      </section>
    </section>
  );
}
