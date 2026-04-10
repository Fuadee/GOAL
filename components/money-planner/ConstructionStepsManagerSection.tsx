'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState, useTransition } from 'react';

import {
  addConstructionStepUpdateAction,
  markConstructionResponseReceivedAction,
  markConstructionStepCompletedAction,
  updateConstructionExecutionStateAction,
  updateConstructionStepStatusAction,
  updateConstructionWaitingDetailsAction
} from '@/app/money-management/actions';
import { ConstructionExecutionState, ConstructionRiskLevel, ConstructionStepRow, ConstructionStepStatus } from '@/lib/money/types';

import { formatDateLabel, getCurrentConstructionStep, getCurrentExecutionState, getNextActionAfterUnblock, getWaitingSummary } from './construction-helpers';
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

export function ConstructionStepsManagerSection({ steps }: Props) {
  const [stepState, setStepState] = useState(steps);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [editWaitingStepId, setEditWaitingStepId] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentStep = useMemo(() => getCurrentConstructionStep(stepState), [stepState]);
  const executionState = getCurrentExecutionState(currentStep);
  const waitingSummary = getWaitingSummary(currentStep);
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

    startTransition(async () => {
      const result = await markConstructionStepCompletedAction(stepId);
      if (!result.success) {
        setStepState(previous);
        setErrorMessage(result.message);
      }
    });
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
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Construction Step Controls</h2>
        <Link href="/money-management" className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
          ← Back to dashboard
        </Link>
      </div>

      <ConstructionWaitingStatusCard
        summary={waitingSummary}
        executionState={executionState}
        riskLevel={currentStep?.risk_level ?? null}
        onAddUpdate={() => (currentStepId ? setActiveStepId(currentStepId) : undefined)}
        onMarkResponseReceived={handleMarkResponseReceived}
        onEditWaitingDetails={() => setEditWaitingStepId(currentStepId)}
      />

      <div className="rounded-3xl border border-white/10 bg-slate-900/55 p-4 md:p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">All milestones ({stepState.length})</p>
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
                      onClick={() => setActiveStepId(step.id)}
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

                <div className="mt-3">
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
      </div>

      {errorMessage ? <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{errorMessage}</p> : null}

      {activeStepId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-white">Add construction update</h4>
              <button type="button" onClick={() => setActiveStepId(null)} className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10">
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
                <span>Expected by</span>
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
