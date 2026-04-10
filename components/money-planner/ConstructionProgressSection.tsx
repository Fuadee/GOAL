'use client';

import { FormEvent, useMemo, useState, useTransition } from 'react';

import {
  addConstructionStepUpdateAction,
  markConstructionResponseReceivedAction,
  markConstructionStepCompletedAction,
  updateConstructionExecutionStateAction,
  updateConstructionStepStatusAction,
  updateConstructionStepTargetDateAction,
  updateConstructionWaitingDetailsAction
} from '@/app/money-management/actions';
import {
  ConstructionExecutionState,
  ConstructionMetricView,
  ConstructionMilestoneView,
  ConstructionRiskLevel,
  ConstructionStepRow,
  ConstructionStepStatus
} from '@/lib/money/types';

import {
  formatDateLabel,
  getCurrentConstructionStep,
  getCurrentExecutionState,
  getCurrentRiskLevel,
  getNextActionAfterUnblock,
  getWaitingSummary
} from './construction-helpers';
import { ConstructionHeroCard } from './ConstructionHeroCard';
import { ConstructionMilestoneStepper } from './ConstructionMilestoneStepper';
import { ConstructionWaitingStatusCard } from './ConstructionWaitingStatusCard';

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
  completed: {
    selectClassName: 'border-emerald-400/60 bg-emerald-950/40 text-emerald-100'
  }
};

const EXECUTION_STATE_BADGES: Record<ConstructionExecutionState, string> = {
  doing: 'border-cyan-400/60 bg-cyan-950/30 text-cyan-100',
  waiting: 'border-amber-400/60 bg-amber-950/40 text-amber-100',
  blocked: 'border-rose-500/70 bg-rose-950/60 text-rose-100',
  follow_up_needed: 'border-violet-400/60 bg-violet-950/40 text-violet-100'
};

const STATUS_LABELS: Record<ConstructionStepStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed'
};

const EXECUTION_STATE_LABELS: Record<ConstructionExecutionState, string> = {
  doing: 'Doing',
  waiting: 'Waiting',
  blocked: 'Blocked',
  follow_up_needed: 'Follow-up Needed'
};

const RISK_LEVEL_OPTIONS: Array<{ value: ConstructionRiskLevel; label: string }> = [
  { value: 'on_track', label: 'On track' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'urgent', label: 'Urgent' }
];

function getStatusLabel(completedSteps: number, totalSteps: number) {
  if (totalSteps === 0) return 'Not Started';
  if (completedSteps === 0) return 'In Progress';
  if (completedSteps >= totalSteps) return 'Completed';
  return 'In Progress';
}

export function ConstructionProgressSection({ steps }: Props) {
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [stepState, setStepState] = useState(steps);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [editWaitingStepId, setEditWaitingStepId] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalSteps = stepState.length;
  const completedSteps = stepState.filter((step) => step.status === 'completed' || step.is_completed).length;
  const progressPercent = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  const currentStep = useMemo(() => getCurrentConstructionStep(stepState), [stepState]);

  const status = getStatusLabel(completedSteps, totalSteps);

  const milestones: ConstructionMilestoneView[] = useMemo(
    () =>
      stepState.map((step) => {
        const isCurrent = currentStep?.id === step.id && step.status !== 'completed' && !step.is_completed;
        let stepStatus: ConstructionMilestoneView['status'] = 'upcoming';

        if (step.status === 'completed' || step.is_completed) stepStatus = 'done';
        else if (isCurrent) stepStatus = 'current';

        return {
          id: step.id,
          order: step.step_order,
          title: step.step_name,
          status: stepStatus,
          targetDateLabel: formatDateLabel(step.target_date, 'No target date')
        };
      }),
    [currentStep?.id, stepState]
  );
  const previewMilestones = useMemo(() => milestones.slice(0, 4), [milestones]);

  const executionState = getCurrentExecutionState(currentStep);
  const riskLevel = getCurrentRiskLevel(currentStep);
  const waitingSummary = getWaitingSummary(currentStep);

  const metrics: ConstructionMetricView[] = [
    { label: 'Total units planned', value: '12 units' },
    { label: 'Current phase', value: currentStep?.step_name ?? 'Planning' },
    { label: 'Milestones done', value: `${completedSteps}/${totalSteps}` },
    { label: 'Estimated income after completion', value: '$120,000/mo' }
  ];

  const currentStepId = currentStep?.id ?? null;

  const handleCompleteStep = (stepId: string) => {
    const previous = stepState;

    setStepState((current) =>
      current.map((step) =>
        step.id === stepId
          ? {
              ...step,
              status: 'completed',
              execution_state: 'doing',
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
              latest_update_text: message,
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

  const handleUpdateExecutionState = (stepId: string, executionStateValue: string) => {
    const previous = stepState;
    const nextState = executionStateValue as ConstructionExecutionState;

    setStepState((current) => current.map((step) => (step.id === stepId ? { ...step, execution_state: nextState } : step)));
    setErrorMessage(null);

    startTransition(async () => {
      const result = await updateConstructionExecutionStateAction(stepId, executionStateValue);
      if (!result.success) {
        setStepState(previous);
        setErrorMessage(result.message);
      }
    });
  };

  const handleMarkResponseReceived = () => {
    if (!currentStepId) return;
    const previous = stepState;

    setStepState((current) =>
      current.map((step) =>
        step.id === currentStepId
          ? {
              ...step,
              execution_state: 'doing',
              waiting_on: null,
              waiting_since: null,
              expected_response_date: null,
              latest_update_text: 'Response received. Continue execution.',
              risk_level: 'on_track'
            }
          : step
      )
    );

    startTransition(async () => {
      const result = await markConstructionResponseReceivedAction(currentStepId);
      if (!result.success) {
        setStepState(previous);
        setErrorMessage(result.message);
      }
    });
  };

  const editingWaitingStep = stepState.find((step) => step.id === editWaitingStepId) ?? null;

  const handleSubmitWaitingDetails = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingWaitingStep) return;

    const formData = new FormData(event.currentTarget);
    const waitingOn = String(formData.get('waiting_on') ?? '');
    const waitingSince = String(formData.get('waiting_since') ?? '');
    const expectedResponseDate = String(formData.get('expected_response_date') ?? '');
    const nextActionLabel = String(formData.get('next_action_label') ?? '');
    const latestUpdateText = String(formData.get('latest_update_text') ?? '');
    const riskLevelValue = String(formData.get('risk_level') ?? '');
    const isCurrentFocus = formData.get('is_current_focus') === 'on';

    const previous = stepState;
    setStepState((current) =>
      current.map((step) =>
        step.id === editingWaitingStep.id
          ? {
              ...step,
              waiting_on: waitingOn || null,
              waiting_since: waitingSince || null,
              expected_response_date: expectedResponseDate || null,
              next_action_label: nextActionLabel || null,
              latest_update_text: latestUpdateText || null,
              risk_level: (riskLevelValue || null) as ConstructionRiskLevel | null,
              is_current_focus: isCurrentFocus
            }
          : { ...step, is_current_focus: isCurrentFocus ? false : step.is_current_focus }
      )
    );

    setEditWaitingStepId(null);

    startTransition(async () => {
      const result = await updateConstructionWaitingDetailsAction(editingWaitingStep.id, {
        waiting_on: waitingOn,
        waiting_since: waitingSince,
        expected_response_date: expectedResponseDate,
        next_action_label: nextActionLabel,
        latest_update_text: latestUpdateText,
        risk_level: riskLevelValue,
        is_current_focus: isCurrentFocus
      });

      if (!result.success) {
        setStepState(previous);
        setErrorMessage(result.message);
      }
    });
  };

  return (
    <section className="space-y-4">
      <ConstructionWaitingStatusCard
        summary={waitingSummary}
        executionState={executionState}
        riskLevel={riskLevel}
        onAddUpdate={() => (currentStepId ? openAddUpdateModal(currentStepId) : undefined)}
        onMarkResponseReceived={handleMarkResponseReceived}
        onEditWaitingDetails={() => setEditWaitingStepId(currentStepId)}
      />

      <ConstructionHeroCard
        statusLabel={status}
        progressPercent={progressPercent}
        metrics={metrics}
      >
        <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4 md:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Milestone preview</p>
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-400">
                {previewMilestones.length} of {milestones.length} steps shown
              </p>
              <button
                type="button"
                onClick={() => setShowAllSteps((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
              >
                {showAllSteps ? 'Hide full steps' : 'View full steps'} →
              </button>
            </div>
          </div>
          <ConstructionMilestoneStepper milestones={previewMilestones} />
        </div>
      </ConstructionHeroCard>

      <div className="rounded-3xl border border-white/10 bg-slate-900/55 p-4 md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Full progress controls</p>
          <p className="text-xs text-slate-400">{showAllSteps ? 'Expanded from project command card' : 'Collapsed — use "View full steps" above to expand'}</p>
        </div>
        {showAllSteps ? (
          <ol className="space-y-3">
            {stepState.map((step) => {
              const isCurrent = Boolean(currentStep) && currentStep.id === step.id && step.status !== 'completed' && !step.is_completed;
              const badge = STATUS_BADGES[step.status];

              return (
                <li key={step.id} className={`rounded-2xl border p-4 ${isCurrent ? 'border-cyan-300/45 bg-cyan-500/5' : 'border-white/10 bg-slate-950/60'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {step.step_order}. {step.step_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">Milestone status: {STATUS_LABELS[step.status]}</p>
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
                        <option value="completed">Completed</option>
                      </select>

                      <select
                        value={step.execution_state}
                        onChange={(event) => handleUpdateExecutionState(step.id, event.target.value)}
                        disabled={isPending}
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide outline-none transition disabled:cursor-not-allowed disabled:opacity-50 ${EXECUTION_STATE_BADGES[step.execution_state]}`}
                      >
                        <option value="doing">Doing</option>
                        <option value="waiting">Waiting</option>
                        <option value="blocked">Blocked</option>
                        <option value="follow_up_needed">Follow-up needed</option>
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
                      <button
                        type="button"
                        onClick={() => setEditWaitingStepId(step.id)}
                        disabled={isPending}
                        className="rounded-full border border-cyan-300/40 px-3 py-1 text-xs text-cyan-100 transition enabled:hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit waiting details
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
                      Latest update: {step.latest_update_text?.trim() || step.latest_update?.trim() || 'No updates logged yet.'}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Execution state: <span className="font-semibold text-slate-200">{EXECUTION_STATE_LABELS[step.execution_state]}</span> · Waiting on:{' '}
                    <span className="text-slate-200">{step.waiting_on || 'N/A'}</span> · Expected by: <span className="text-slate-200">{formatDateLabel(step.expected_response_date, 'No ETA')}</span> · Next action:{' '}
                    <span className="text-slate-200">{getNextActionAfterUnblock(step)}</span>
                  </p>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
            Full controls are collapsed. Expand to manage statuses, waiting details, target dates, and updates for all {totalSteps} milestones.
          </p>
        )}
      </div>

      {errorMessage ? <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{errorMessage}</p> : null}

      {activeStepId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-white">Add construction update</h4>
              <button type="button" onClick={closeAddUpdateModal} className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10">
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

      {editingWaitingStep ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-white">Edit waiting details</h4>
              <button type="button" onClick={() => setEditWaitingStepId(null)} className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10">
                Close
              </button>
            </div>

            <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmitWaitingDetails}>
              <label className="space-y-1 text-xs text-slate-300">
                <span>Waiting on / Owner</span>
                <input name="waiting_on" defaultValue={editingWaitingStep.waiting_on ?? ''} className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-slate-100" />
              </label>
              <label className="space-y-1 text-xs text-slate-300">
                <span>Waiting since</span>
                <input type="date" name="waiting_since" defaultValue={editingWaitingStep.waiting_since ?? ''} className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-slate-100" />
              </label>
              <label className="space-y-1 text-xs text-slate-300">
                <span>Expected response date</span>
                <input type="date" name="expected_response_date" defaultValue={editingWaitingStep.expected_response_date ?? ''} className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-slate-100" />
              </label>
              <label className="space-y-1 text-xs text-slate-300">
                <span>Risk level</span>
                <select name="risk_level" defaultValue={editingWaitingStep.risk_level ?? ''} className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-slate-100">
                  <option value="">None</option>
                  {RISK_LEVEL_OPTIONS.map((riskOption) => (
                    <option key={riskOption.value} value={riskOption.value}>
                      {riskOption.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs text-slate-300 md:col-span-2">
                <span>Next action after unblocking</span>
                <input name="next_action_label" defaultValue={editingWaitingStep.next_action_label ?? ''} className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-slate-100" />
              </label>
              <label className="space-y-1 text-xs text-slate-300 md:col-span-2">
                <span>Waiting reason / latest status note</span>
                <textarea
                  name="latest_update_text"
                  rows={4}
                  defaultValue={editingWaitingStep.latest_update_text ?? editingWaitingStep.latest_update ?? ''}
                  className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 md:col-span-2">
                <input type="checkbox" name="is_current_focus" defaultChecked={editingWaitingStep.is_current_focus} />
                Set this step as current focus
              </label>
              <div className="flex justify-end gap-2 md:col-span-2">
                <button type="submit" className="rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/15">
                  Save waiting details
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
