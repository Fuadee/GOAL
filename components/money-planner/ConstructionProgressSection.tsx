'use client';

import { FormEvent, useMemo, useState, useTransition } from 'react';

import {
  addConstructionStepUpdateAction,
  markConstructionStepCompletedAction,
  updateConstructionStepStatusAction,
  updateConstructionStepTargetDateAction
} from '@/app/money-management/actions';
import { ConstructionFocusView, ConstructionMetricView, ConstructionMilestoneView, ConstructionStepRow, ConstructionStepStatus } from '@/lib/money/types';

import { ConstructionHeroCard } from './ConstructionHeroCard';

type Props = {
  steps: ConstructionStepRow[];
};

type BadgeConfig = {
  selectClassName: string;
};

const STATUS_BADGES: Record<ConstructionStepStatus, BadgeConfig> = {
  not_started: {
    selectClassName: 'border-slate-500/50 bg-slate-800 text-slate-100'
  },
  in_progress: {
    selectClassName: 'border-cyan-400/60 bg-cyan-950/30 text-cyan-100'
  },
  waiting: {
    selectClassName: 'border-amber-400/60 bg-amber-950/40 text-amber-100'
  },
  blocked: {
    selectClassName: 'border-rose-500/70 bg-rose-950/60 text-rose-100'
  },
  completed: {
    selectClassName: 'border-emerald-400/60 bg-emerald-950/40 text-emerald-100'
  }
};

const STATUS_LABELS: Record<ConstructionStepStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  waiting: 'Waiting',
  blocked: 'Blocked',
  completed: 'Completed'
};

function getStatusLabel(completedSteps: number, totalSteps: number) {
  if (totalSteps === 0) return 'Not Started';
  if (completedSteps === 0) return 'In Progress';
  if (completedSteps >= totalSteps) return 'Completed';
  return 'In Progress';
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

  const nextStep = useMemo(() => {
    if (!currentStep) return null;
    return stepState.find((step) => step.step_order > currentStep.step_order && step.status !== 'completed' && !step.is_completed) ?? null;
  }, [currentStep, stepState]);

  const status = getStatusLabel(completedSteps, totalSteps);

  const milestones: ConstructionMilestoneView[] = useMemo(
    () =>
      stepState.map((step) => {
        const isCurrent = currentStep?.id === step.id && step.status !== 'completed' && !step.is_completed;
        let stepStatus: ConstructionMilestoneView['status'] = 'upcoming';

        if (step.status === 'completed' || step.is_completed) stepStatus = 'done';
        else if (step.status === 'blocked' || step.status === 'waiting') stepStatus = 'blocked';
        else if (isCurrent) stepStatus = 'current';

        return {
          id: step.id,
          order: step.step_order,
          title: step.step_name,
          status: stepStatus,
          targetDateLabel: formatTargetDate(step.target_date)
        };
      }),
    [currentStep?.id, stepState]
  );

  const focus: ConstructionFocusView = {
    currentStep: currentStep?.step_name ?? 'No active step',
    progressLabel: `${progressPercent}%`,
    nextMilestone: nextStep?.step_name ?? 'Complete and rent out',
    targetDateLabel: currentStep?.target_date ? formatTargetDate(currentStep.target_date) : 'TBD',
    latestUpdate: currentStep?.latest_update?.trim() || 'Waiting for authority submission documents'
  };

  const metrics: ConstructionMetricView[] = [
    { label: 'Total units planned', value: '12 units' },
    { label: 'Current phase', value: currentStep?.step_name ?? 'Planning' },
    { label: 'Milestones done', value: `${completedSteps}/${totalSteps}` },
    { label: 'Estimated income after completion', value: '$120,000/mo' }
  ];

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

  const handleUpdateTargetDate = (stepId: string, date: string) => {
    const previous = stepState;
    const normalizedDate = date || null;

    setStepState((current) => current.map((step) => (step.id === stepId ? { ...step, target_date: normalizedDate } : step)));
    setErrorMessage(null);

    startTransition(async () => {
      const result = await updateConstructionStepTargetDateAction(stepId, date);

      if (!result.success) {
        setStepState(previous);
        setErrorMessage(result.message);
      }
    });
  };

  const handleUpdateStatus = (stepId: string, status: string) => {
    const previous = stepState;
    const nextStatus = status as ConstructionStepStatus;

    setStepState((current) =>
      current.map((step) =>
        step.id === stepId
          ? {
              ...step,
              status: nextStatus,
              is_completed: nextStatus === 'completed',
              completed_at: nextStatus === 'completed' ? step.completed_at ?? new Date().toISOString() : null
            }
          : step
      )
    );
    setErrorMessage(null);

    startTransition(async () => {
      const result = await updateConstructionStepStatusAction(stepId, status);

      if (!result.success) {
        setStepState(previous);
        setErrorMessage(result.message);
      }
    });
  };

  return (
    <section className="space-y-4">
      <ConstructionHeroCard
        statusLabel={status}
        progressPercent={progressPercent}
        focus={focus}
        metrics={metrics}
        milestones={milestones}
        onToggleDetails={() => setExpanded((value) => !value)}
        expanded={expanded}
      />

      {expanded ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/55 p-4 md:p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Full progress controls</p>
          <ol className="space-y-3">
            {stepState.map((step) => {
              const isCurrent = Boolean(currentStep) && currentStep.id === step.id && step.status !== 'completed' && !step.is_completed;
              const badge = STATUS_BADGES[step.status];

              return (
                <li key={step.id} className={`rounded-2xl border p-4 ${isCurrent ? 'border-cyan-300/45 bg-cyan-500/5' : 'border-white/10 bg-slate-950/60'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{step.step_order}. {step.step_name}</p>
                      <p className="mt-1 text-xs text-slate-400">{STATUS_LABELS[step.status]}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={step.status}
                        onChange={(event) => handleUpdateStatus(step.id, event.target.value)}
                        disabled={isPending}
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide outline-none transition disabled:cursor-not-allowed disabled:opacity-50 ${badge.selectClassName}`}
                      >
                        <option value="not_started">Not started</option>
                        <option value="in_progress">In progress</option>
                        <option value="waiting">Waiting</option>
                        <option value="blocked">Blocked</option>
                        <option value="completed">Completed</option>
                      </select>
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

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label htmlFor={`target-date-${step.id}`} className="space-y-1 text-[11px] uppercase tracking-wide text-slate-400">
                      <span className="block">Target date</span>
                      <input
                        id={`target-date-${step.id}`}
                        type="date"
                        value={step.target_date || ''}
                        onChange={(event) => handleUpdateTargetDate(step.id, event.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-cyan-300"
                      />
                    </label>
                    <p className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
                      Latest update: {step.latest_update?.trim() ? step.latest_update : 'No updates logged yet.'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {errorMessage ? <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{errorMessage}</p> : null}

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
