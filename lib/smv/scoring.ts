import { SmvDimensionWithScore, SmvTrendDirection } from '@/lib/smv/types';

export function clampSmvScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function applyScoreDelta(current: number, delta: number): number {
  return clampSmvScore(current + delta);
}

export function getTrendDirection(current: number, previous: number): SmvTrendDirection {
  if (current > previous) {
    return 'up';
  }

  if (current < previous) {
    return 'down';
  }

  return 'flat';
}

export function getStrongestDimension(scores: SmvDimensionWithScore[]): SmvDimensionWithScore | null {
  if (scores.length === 0) {
    return null;
  }

  return [...scores].sort((a, b) => b.currentScore - a.currentScore)[0] ?? null;
}

export function getWeakestDimensions(scores: SmvDimensionWithScore[], count: number): SmvDimensionWithScore[] {
  return [...scores].sort((a, b) => a.currentScore - b.currentScore).slice(0, count);
}

export function buildFocusNowMessage(weakestDimensions: SmvDimensionWithScore[]): string {
  if (weakestDimensions.length === 0) {
    return 'Track checklist activity to generate a personalized focus recommendation.';
  }

  const labels = weakestDimensions.map((dimension) => dimension.label).join(' + ');
  return `Focus now: improve ${labels} with 1-2 checklist wins per day to lift your overall SMV faster.`;
}
