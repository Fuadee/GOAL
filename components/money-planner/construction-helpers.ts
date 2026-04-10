import { ConstructionExecutionState, ConstructionRiskLevel, ConstructionStepRow, ConstructionWaitingSummaryView } from '@/lib/money/types';

export function formatDateLabel(value: string | null, fallback = 'Not set') {
  if (!value) return fallback;

  const target = new Date(`${value}T00:00:00Z`);
  return Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(target);
}

export function getCurrentConstructionStep(steps: ConstructionStepRow[]): ConstructionStepRow | null {
  return (
    steps.find((step) => step.is_current_focus) ??
    steps.find((step) => step.status === 'in_progress' && !step.is_completed) ??
    steps.find((step) => step.status !== 'completed' && !step.is_completed) ??
    steps[steps.length - 1] ??
    null
  );
}

export function getCurrentExecutionState(step: ConstructionStepRow | null): ConstructionExecutionState | null {
  if (!step) return null;
  return step.execution_state;
}

export function getNextActionAfterUnblock(step: ConstructionStepRow | null): string {
  return step?.next_action_label?.trim() || 'No next action defined yet';
}

export function getCurrentRiskLevel(step: ConstructionStepRow | null): ConstructionRiskLevel | null {
  if (!step) return null;
  return step.risk_level;
}

export function getWaitingSummary(step: ConstructionStepRow | null): ConstructionWaitingSummaryView {
  if (!step) {
    return {
      currentStep: 'No active step selected',
      executionState: null,
      waitingOn: 'N/A',
      waitingSince: 'N/A',
      expectedBy: 'N/A',
      nextAction: 'N/A',
      latestUpdate: 'No update yet.',
      riskLevel: null,
      waitingReason: 'No active step selected'
    };
  }

  return {
    currentStep: step.step_name,
    executionState: step.execution_state,
    waitingOn: step.waiting_on?.trim() || 'Not assigned',
    waitingSince: formatDateLabel(step.waiting_since, 'Not started'),
    expectedBy: formatDateLabel(step.expected_response_date, 'No ETA'),
    nextAction: getNextActionAfterUnblock(step),
    latestUpdate: step.latest_update_text?.trim() || step.latest_update?.trim() || 'No update yet.',
    riskLevel: step.risk_level,
    waitingReason: step.latest_update_text?.trim() || step.latest_update?.trim() || 'Waiting details not logged yet.'
  };
}
