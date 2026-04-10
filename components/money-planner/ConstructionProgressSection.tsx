'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { markConstructionStepCompletedAction } from '@/app/money-management/actions';
import { ConstructionStepRow } from '@/lib/money/types';

type Props = {
  steps: ConstructionStepRow[];
};

function getStatusLabel(completedSteps: number, totalSteps: number) {
  if (totalSteps === 0) return 'Not started';
  if (completedSteps === 0) return 'Not started';
  if (completedSteps >= totalSteps) return 'Completed';
  return 'In progress';
}

export function ConstructionProgressSection({ steps }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalSteps = steps.length;
  const completedSteps = steps.filter((step) => step.is_completed).length;
  const progressPercent = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  const currentStep = useMemo(() => {
    return steps.find((step) => !step.is_completed) ?? steps[steps.length - 1] ?? null;
  }, [steps]);

  const status = getStatusLabel(completedSteps, totalSteps);

  const handleCompleteStep = (stepId: string) => {
    startTransition(async () => {
      await markConstructionStepCompletedAction(stepId);
      router.refresh();
    });
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Construction – Baan Na Teen</h3>
          <div className="mt-2 space-y-1 text-sm text-slate-300">
            <p>
              Progress: <span className="font-semibold text-slate-100">{progressPercent}%</span>
            </p>
            <p>
              Status: <span className="font-semibold text-slate-100">{status}</span>
            </p>
            <p>
              Current step: <span className="font-semibold text-slate-100">{currentStep?.step_name ?? 'No steps configured'}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
        >
          {expanded ? 'Hide progress' : 'View progress'}
        </button>
      </div>

      {expanded ? (
        <div className="mt-4 border-t border-white/10 pt-4">
          <ol className="space-y-3">
            {steps.map((step, index) => {
              const isCurrent = Boolean(currentStep) && currentStep.id === step.id && !step.is_completed;

              return (
                <li key={step.id} className="relative pl-7">
                  <span
                    className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${
                      step.is_completed ? 'bg-emerald-400' : isCurrent ? 'bg-cyan-300' : 'bg-slate-600'
                    }`}
                  />
                  {index < steps.length - 1 ? <span className="absolute left-[5px] top-5 h-8 w-px bg-slate-700" aria-hidden /> : null}

                  <div
                    className={`rounded-xl border p-3 ${
                      isCurrent ? 'border-cyan-300/50 bg-cyan-500/5' : 'border-white/10 bg-slate-950/50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-100">{step.step_order}. {step.step_name}</p>
                      <button
                        type="button"
                        disabled={step.is_completed || isPending}
                        onClick={() => handleCompleteStep(step.id)}
                        className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-200 transition enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {step.is_completed ? 'Completed' : 'Mark completed'}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
