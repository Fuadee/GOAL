import {
  DiscoveryCandidateStatus,
  InnovationCardViewModel,
  InnovationProcessStepSummary,
  InnovationStatus
} from '@/lib/innovation/types';

const CURRENT_MISSION_STATUS_PRIORITY: InnovationStatus[] = ['building', 'testing', 'idea', 'blocked'];

function compareSteps(a: InnovationProcessStepSummary, b: InnovationProcessStepSummary): number {
  const orderA = a.step_order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.step_order ?? Number.MAX_SAFE_INTEGER;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

export function getNextStep(innovation: InnovationCardViewModel): InnovationProcessStepSummary | null {
  return innovation.steps.filter((step) => step.status !== 'done').sort(compareSteps)[0] ?? null;
}

export function getCurrentInnovation(innovations: InnovationCardViewModel[]): InnovationCardViewModel | null {
  return (
    innovations
      .filter((innovation) => innovation.status !== 'completed')
      .sort((a, b) => {
        if (a.status !== b.status) {
          return CURRENT_MISSION_STATUS_PRIORITY.indexOf(a.status) - CURRENT_MISSION_STATUS_PRIORITY.indexOf(b.status);
        }

        if (b.progressPercent !== a.progressPercent) {
          return b.progressPercent - a.progressPercent;
        }

        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      })[0] ?? null
  );
}

export function getDiscoveryGap(innovations: InnovationCardViewModel[], goal = 10): number {
  return Math.max(goal - innovations.length, 0);
}

export function getNextDiscoveryAction(gap: number): string {
  if (gap > 0) {
    return 'บันทึก pain point จากงานที่ทำซ้ำบ่อย';
  }

  return 'review และ improve innovation ที่มี';
}

const DISCOVERY_STATUS_ORDER: DiscoveryCandidateStatus[] = ['observed', 'pain_point', 'concept', 'validated', 'converted'];

export function sortDiscoveryCandidatesByPipeline(status: DiscoveryCandidateStatus): number {
  return DISCOVERY_STATUS_ORDER.indexOf(status);
}
