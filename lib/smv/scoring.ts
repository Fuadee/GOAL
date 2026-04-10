import { SmvDimensionKey, SmvEvidenceLogRow, SmvEvidenceMetricValueRow, SmvMetricRow } from '@/lib/smv/types';

type MetricValueMap = Record<string, number>;

export type SmvScoreResult = {
  score: number;
  breakdown: Record<string, number>;
  guardSummary: string;
  explanation: string;
  suggestions: string[];
  evidenceCount30d: number;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function normalizeMetric(metric: SmvMetricRow, value: number): number {
  if (metric.value_type === 'currency_monthly') {
    return clamp((value / 200000) * 100);
  }

  if (metric.value_type === 'count') {
    return clamp((value / 20) * 100);
  }

  return clamp(value);
}

function weightedAverage(metrics: SmvMetricRow[], values: MetricValueMap) {
  let weightedTotal = 0;
  let weightTotal = 0;
  const breakdown: Record<string, number> = {};

  for (const metric of metrics) {
    const raw = values[metric.key] ?? 0;
    const normalized = normalizeMetric(metric, raw);
    const contribution = normalized * Number(metric.weight);
    breakdown[metric.key] = Number(normalized.toFixed(2));
    weightedTotal += contribution;
    weightTotal += Number(metric.weight);
  }

  if (weightTotal === 0) {
    return { average: 0, breakdown };
  }

  return { average: weightedTotal / weightTotal, breakdown };
}

function buildLatestMetricMap(metrics: SmvMetricRow[], evidenceValues: SmvEvidenceMetricValueRow[]): MetricValueMap {
  const map: MetricValueMap = {};

  for (const metric of metrics) {
    const value = evidenceValues.find((item) => item.metric_id === metric.id);
    if (!value) {
      map[metric.key] = 0;
      continue;
    }

    const numeric = value.numeric_value;
    map[metric.key] = numeric ?? (value.boolean_value ? 100 : 0);
  }

  return map;
}

export function calculateSmvDimensionScore(input: {
  dimensionKey: SmvDimensionKey;
  metrics: SmvMetricRow[];
  latestEvidenceValues: SmvEvidenceMetricValueRow[];
  evidenceLogs30d: SmvEvidenceLogRow[];
}): SmvScoreResult {
  const { dimensionKey, metrics, latestEvidenceValues, evidenceLogs30d } = input;
  const evidenceCount30d = evidenceLogs30d.length;
  const metricMap = buildLatestMetricMap(metrics, latestEvidenceValues);
  const { average, breakdown } = weightedAverage(metrics, metricMap);

  let score = clamp(average);
  const guardReasons: string[] = [];
  const suggestions: string[] = [];

  if (dimensionKey === 'confidence') {
    if (evidenceCount30d < 8) {
      score = Math.min(score, 65);
      guardReasons.push('Confidence capped at 65: interaction evidence in last 30 days is too low (< 8).');
      suggestions.push('Log at least 8 confidence interactions in 30 days.');
    }

    const highPressure = metricMap.situation_coverage ?? 0;
    if (highPressure < 3) {
      score = Math.min(score, 75);
      guardReasons.push('Confidence capped at 75: no sufficient high-pressure interactions.');
      suggestions.push('Complete 2 more high-pressure interactions this week.');
    }
  }

  if (dimensionKey === 'status') {
    const incomeLevel = metricMap.income_level ?? 0;
    if (incomeLevel < 100000) {
      score = Math.min(score, 85);
      guardReasons.push('Status capped at 85: income threshold 100,000 THB/month not met.');
      suggestions.push('Sustain 100k+ monthly income for 3 months.');
    }
  }

  if (dimensionKey === 'look' && evidenceCount30d < 6) {
    score = Math.min(score, 70);
    guardReasons.push('Look capped at 70: not enough visual-consistency evidence in 30 days.');
    suggestions.push('Maintain grooming consistency for 14 consecutive days.');
  }

  if (dimensionKey === 'purpose' && (metricMap.execution ?? 0) < 60) {
    score = Math.min(score, 80);
    guardReasons.push('Purpose capped at 80: execution quality below reliability threshold.');
    suggestions.push('Ship weekly measurable outcomes for 4 straight weeks.');
  }

  if (guardReasons.length === 0) {
    guardReasons.push('No active caps; score reflects weighted evidence metrics.');
  }

  if (suggestions.length === 0) {
    suggestions.push('Continue logging quality evidence to stabilize this score.');
  }

  return {
    score: Number(score.toFixed(2)),
    breakdown,
    guardSummary: guardReasons.join(' '),
    explanation: `Score derived from weighted metrics (${metrics.length}) and ${evidenceCount30d} evidence logs in the last 30 days.`,
    suggestions,
    evidenceCount30d
  };
}

export function buildDefaultRecommendations(weakest: Array<{ key: SmvDimensionKey; label: string }>) {
  return weakest.map((item) => {
    if (item.key === 'confidence') return 'Confidence: complete 2 more high-pressure interactions.';
    if (item.key === 'look') return 'Look: maintain grooming consistency for 14 days.';
    if (item.key === 'status') return 'Status: sustain 100k+ income for 3 months.';
    if (item.key === 'purpose') return 'Purpose: close one measurable weekly milestone for 4 weeks.';
    return `${item.label}: continue evidence logging to unlock metric set expansion.`;
  });
}
