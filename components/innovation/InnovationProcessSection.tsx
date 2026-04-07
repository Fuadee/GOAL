'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import {
  createInnovationProcessStepAction,
  updateInnovationProcessStepStatusAction
} from '@/app/innovation/[id]/actions';
import { INNOVATION_STEP_STATUS, InnovationProcessStepRow, InnovationStepStatus } from '@/lib/innovation/types';

type InnovationProcessSectionProps = {
  innovationId: string;
  steps: InnovationProcessStepRow[];
};

const stepStatusStyles: Record<InnovationStepStatus, string> = {
  todo: 'bg-slate-500/20 text-slate-300 border border-slate-400/30',
  in_progress: 'bg-amber-500/20 text-amber-300 border border-amber-400/40',
  done: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
};

export function InnovationProcessSection({ innovationId, steps }: InnovationProcessSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h2 className="text-xl font-semibold text-white">Process Checklist</h2>

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
        className="grid gap-3 rounded-xl border border-white/10 bg-slate-900/40 p-4"
      >
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Add process step</h3>
        <input
          name="title"
          type="text"
          required
          placeholder="Step title"
          className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
        />
        <textarea
          name="description"
          rows={2}
          placeholder="Step description"
          className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
        />
        <input name="step_order" type="number" min={1} placeholder="Order (optional)" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300" />
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button
          type="submit"
          disabled={isPending}
          className="w-fit rounded-full bg-indigo-400/20 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-400/30 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Add step'}
        </button>
      </form>

      {steps.length === 0 ? (
        <p className="text-slate-300">No process steps yet. Define the real checklist first.</p>
      ) : (
        <ul className="space-y-3">
          {steps.map((step) => (
            <li key={step.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{step.title}</p>
                  {step.description ? <p className="text-sm text-slate-300">{step.description}</p> : null}
                </div>

                <form
                  action={(formData) => {
                    startTransition(async () => {
                      await updateInnovationProcessStepStatusAction(innovationId, step.id, formData);
                      router.refresh();
                    });
                  }}
                >
                  <select
                    name="status"
                    defaultValue={step.status}
                    className={`rounded-full px-3 py-2 text-xs font-semibold ${stepStatusStyles[step.status]}`}
                  >
                    {INNOVATION_STEP_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="ml-2 rounded-full bg-white/10 px-3 py-2 text-xs text-white">
                    Update
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
