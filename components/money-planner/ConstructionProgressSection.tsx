'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { ConstructionMetricView, ConstructionMilestoneView, ConstructionStepRow } from '@/lib/money/types';

import { formatDateLabel, getCurrentConstructionStep, getCurrentExecutionState, getCurrentRiskLevel, getWaitingSummary } from './construction-helpers';
import { ConstructionHeroCard } from './ConstructionHeroCard';
import { ConstructionMilestoneStepper } from './ConstructionMilestoneStepper';
import { ConstructionWaitingStatusCard } from './ConstructionWaitingStatusCard';

type Props = {
  steps: ConstructionStepRow[];
};

function getStatusLabel(completedSteps: number, totalSteps: number) {
  if (totalSteps === 0) return 'Not Started';
  if (completedSteps === 0) return 'In Progress';
  if (completedSteps >= totalSteps) return 'Completed';
  return 'In Progress';
}

export function ConstructionProgressSection({ steps }: Props) {
  const router = useRouter();

  const totalSteps = steps.length;
  const completedSteps = steps.filter((step) => step.status === 'completed' || step.is_completed).length;
  const progressPercent = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  const currentStep = useMemo(() => getCurrentConstructionStep(steps), [steps]);

  const status = getStatusLabel(completedSteps, totalSteps);

  const milestones: ConstructionMilestoneView[] = useMemo(
    () =>
      steps.map((step) => {
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
    [currentStep?.id, steps]
  );
  const executionState = getCurrentExecutionState(currentStep);
  const riskLevel = getCurrentRiskLevel(currentStep);
  const waitingSummary = getWaitingSummary(currentStep);

  const metrics: ConstructionMetricView[] = [
    { label: 'Total units planned', value: '12 units' },
    { label: 'Current phase', value: currentStep?.step_name ?? 'Planning' },
    { label: 'Milestones done', value: `${completedSteps}/${totalSteps}` },
    { label: 'Estimated income after completion', value: '$120,000/mo' }
  ];

  return (
    <section className="space-y-4">
      <ConstructionWaitingStatusCard summary={waitingSummary} executionState={executionState} riskLevel={riskLevel} showControls={false} />

      <ConstructionHeroCard statusLabel={status} progressPercent={progressPercent} metrics={metrics}>
        <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4 md:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Project milestones</p>
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-400">{milestones.length} total milestones</p>
              <button
                type="button"
                onClick={() => router.push('/money-management/construction/steps')}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
              >
                View full steps →
              </button>
            </div>
          </div>
          <ConstructionMilestoneStepper milestones={milestones} />
        </div>
      </ConstructionHeroCard>
    </section>
  );
}
