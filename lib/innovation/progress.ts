import { deriveInnovationState } from './helpers';
import { goalPercentage } from '../progress';
import type { InnovationCardViewModel } from './types';

export const TARGET_INNOVATIONS = 10;

export function getCompletedInnovations(innovations: InnovationCardViewModel[]) {
  return innovations.filter((innovation) => deriveInnovationState(innovation) === 'completed')
    .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime());
}

export function getInnovationGoalProgress(innovations: InnovationCardViewModel[]) {
  const completed = getCompletedInnovations(innovations).length;
  return { completed, total: TARGET_INNOVATIONS, percentage: goalPercentage(completed, TARGET_INNOVATIONS) };
}
