'use client';

import { FormEvent, useMemo, useState, useTransition } from 'react';

import { addConstructionStepUpdateAction, markConstructionStepCompletedAction } from '@/app/money-management/actions';
import { ConstructionStepRow, ConstructionStepStatus } from '@/lib/money/types';

type Props = {
  steps: ConstructionStepRow[];
};

type BadgeConfig = {
  label: string;
  className: string;
};

const STATUS_BADGES: Record<ConstructionStepStatus, BadgeConfig> = {
  not_started: {
    label: 'Not started',
    className: 'border-slate-500/40 bg-slate-500/10 text-slate-200'
  },
  in_progress: {
    label: 'In progress',
    className: 'border-amber-400/50 bg-amber-500/15 text-amber-200'
  },
  waiting: {
    label: 'Waiting',
    className: 'border-red-400/50 bg-red-500/15 text-red-200'
  },
  blocked: {
    label: 'Blocked',
    className: 'border-rose-400/50 bg-rose-500/15 text-rose-200'
  },
  completed: {
    label: 'Completed',
    className: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
  }
};

function getStatusLabel(completedSteps: number, totalSteps: number) {
  if (totalSteps === 0) return 'Not started';
  if (completedSteps === 0) return 'Not started';
  if (completedSteps >= totalSteps) return 'Completed';
  return 'In progress';
}

function formatTargetDate(value: string | null) {
  if (!value) return 'No target date';

  const target = new Date(`${value}T00:00:00Z`);
  return Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(target);
}

export function ConstructionProgressSection({ steps }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [stepState, setStepState] = useState(steps);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalSteps = stepState.length;
  const completedSteps = stepState.filter((step) => step.status === 'completed' || step.is_completed).length;
  const progressPercent = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  const currentStep = useMemo(() => {
    return stepState.find((step) => step.status !== 'completed' && !step.is_completed) ?? stepState[stepState.length - 1] ?? null;
  }, [stepState]);

  const status = getStatusLabel(completedSteps, totalSteps);

  const handleCompleteStep = (stepId: string) => {
    const previous = stepState;

    setStepState((current) =>
      current.map((step) =>
        step.id === stepId
          ? {
              ...step,
              status: 'completed',
              is_completed: true,
              completed_at: new Date().toISOString()
            }
          : step
      )
    );
    setErrorMessage(null);

    startTransition(async () => {
      const result = await markConstructionStepCompletedAction(stepId);

      if (!result.success) {
        setStepState(previous);
        setErrorMessage(result.message);
      }
    });
  };

  const openAddUpdateModal = (stepId: string) => {
    setActiveStepId(stepId);
    setUpdateMessage('');
    setErrorMessage(null);
  };

  const closeAddUpdateModal = () => {
    if (isPending) return;
    setActiveStepId(null);
    setUpdateMessage('');
  };

  const handleSubmitUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeStepId) return;

    const message = updateMessage.trim();
    if (!message) {
      setErrorMessage('Update message is required.');
      return;
    }

    const previous = stepState;
    setStepState((current) =>
      current.map((step) =>
        step.id === activeStepId
          ? {
              ...step,
              latest_update: message,
              status: step.status === 'not_started' ? 'in_progress' : step.status
            }
          : step
      )
    );
    setErrorMessage(null);
    setActiveStepId(null);
    setUpdateMessage('');

    startTransition(async () => {
      const result = await addConstructionStepUpdateAction(activeStepId, message);

      if (!result.success) {
        setStepState(previous);
        setErrorMessage(result.message);
      }
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
            {stepState.map((step, index) => {
              const isCurrent = Boolean(currentStep) && currentStep.id === step.id && step.status !== 'completed' && !step.is_completed;
              const badge = STATUS_BADGES[step.status];

              return (
                <li key={step.id} className="relative pl-7">
                  <span
                    className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${
                      step.status === 'completed' || step.is_completed ? 'bg-emerald-400' : isCurrent ? 'bg-cyan-300' : 'bg-slate-600'
                    }`}
                  />
                  {index < stepState.length - 1 ? <span className="absolute left-[5px] top-5 h-28 w-px bg-slate-700" aria-hidden /> : null}

                  <div
                    className={`rounded-xl border p-4 ${
                      isCurrent ? 'border-cyan-300/50 bg-cyan-500/5' : 'border-white/10 bg-slate-950/50'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-100">
                          {step.step_order}. {step.step_name}
                        </p>
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={step.status === 'completed' || step.is_completed || isPending}
                          onClick={() => handleCompleteStep(step.id)}
                          className="rounded-full border border-emerald-400/40 px-3 py-1 text-xs text-emerald-200 transition enabled:hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {step.status === 'completed' || step.is_completed ? 'Completed' : 'Mark completed'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openAddUpdateModal(step.id)}
                          disabled={isPending}
                          className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200 transition enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Add update
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2 text-xs text-slate-300">
                      <p>
                        Target date: <span className="font-medium text-slate-100">{formatTargetDate(step.target_date)}</span>
                      </p>
                      <p className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-200">
                        Latest update: {step.latest_update?.trim() ? step.latest_update : 'No updates logged yet.'}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {errorMessage ? <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{errorMessage}</p> : null}

      {activeStepId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-white">Add construction update</h4>
              <button
                type="button"
                onClick={closeAddUpdateModal}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleSubmitUpdate}>
              <textarea
                value={updateMessage}
                onChange={(event) => setUpdateMessage(event.target.value)}
                rows={5}
                placeholder="Log field update, blocker, or progress details..."
                className="w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-medium text-cyan-100 transition enabled:hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save update
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
