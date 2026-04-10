import { SmvDimensionKey, SmvEvidenceLogRow, SmvEvidenceMetricValueRow, SmvMetricRow } from '@/lib/smv/types';

type MetricValueMap = Record<string, number>;

type RecencyBucket = 'last_14_days' | 'day_15_to_30' | 'day_31_to_60' | 'older_than_60';

const RECENCY_WEIGHTS: Record<RecencyBucket, number> = {
  last_14_days: 1,
  day_15_to_30: 0.7,
  day_31_to_60: 0.4,
  older_than_60: 0.2
};

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

function getRecencyBucket(loggedAt: string): RecencyBucket {
  const loggedAtMs = new Date(loggedAt).getTime();
  const nowMs = Date.now();
  const daysAgo = (nowMs - loggedAtMs) / (1000 * 60 * 60 * 24);

  if (daysAgo <= 14) return 'last_14_days';
  if (daysAgo <= 30) return 'day_15_to_30';
  if (daysAgo <= 60) return 'day_31_to_60';
  return 'older_than_60';
}

function buildEvidenceWeightedMetricMap(input: {
  metrics: SmvMetricRow[];
  evidenceValues: SmvEvidenceMetricValueRow[];
  evidenceLogs: SmvEvidenceLogRow[];
}): { metricMap: MetricValueMap; recencyShareLast14d: number } {
  const { metrics, evidenceValues, evidenceLogs } = input;
  const logTimeMap = new Map(evidenceLogs.map((log) => [log.id, log.logged_at]));
  const metricMap: MetricValueMap = {};

  let recencyWeightedTotal = 0;
  let maxRecencyTotal = 0;

  for (const metric of metrics) {
    const entries = evidenceValues.filter((item) => item.metric_id === metric.id && logTimeMap.has(item.evidence_log_id));
    if (entries.length === 0) {
      metricMap[metric.key] = 0;
      continue;
    }

    let weightedValueTotal = 0;
    let weightTotal = 0;

    for (const entry of entries) {
      const rawValue = entry.numeric_value ?? (entry.boolean_value ? 100 : 0);
      const loggedAt = logTimeMap.get(entry.evidence_log_id);
      if (!loggedAt) continue;

      const recencyBucket = getRecencyBucket(loggedAt);
      const recencyWeight = RECENCY_WEIGHTS[recencyBucket];

      weightedValueTotal += rawValue * recencyWeight;
      weightTotal += recencyWeight;

      recencyWeightedTotal += recencyWeight;
      maxRecencyTotal += 1;
    }

    const rawWeightedAverage = weightTotal > 0 ? weightedValueTotal / weightTotal : 0;
    metricMap[metric.key] = rawWeightedAverage;
  }

  const recencyShareLast14d = maxRecencyTotal > 0 ? clamp((recencyWeightedTotal / maxRecencyTotal) / RECENCY_WEIGHTS.last_14_days, 0, 1) : 0;

  return { metricMap, recencyShareLast14d };
}

function weightedAverage(metrics: SmvMetricRow[], values: MetricValueMap, overrideWeights?: Record<string, number>) {
  let weightedTotal = 0;
  let weightTotal = 0;
  const breakdown: Record<string, number> = {};

  for (const metric of metrics) {
    const raw = values[metric.key] ?? 0;
    const normalized = normalizeMetric(metric, raw);
    const weight = Number(overrideWeights?.[metric.key] ?? metric.weight);
    const contribution = normalized * weight;
    breakdown[metric.key] = Number(normalized.toFixed(2));
    weightedTotal += contribution;
    weightTotal += weight;
  }

  if (weightTotal === 0) {
    return { average: 0, breakdown };
  }

  return { average: weightedTotal / weightTotal, breakdown };
}

export function calculateSmvDimensionScore(input: {
  dimensionKey: SmvDimensionKey;
  metrics: SmvMetricRow[];
  latestEvidenceValues: SmvEvidenceMetricValueRow[];
  evidenceLogs30d: SmvEvidenceLogRow[];
}): SmvScoreResult {
  const { dimensionKey, metrics, latestEvidenceValues, evidenceLogs30d } = input;
  const evidenceCount30d = evidenceLogs30d.length;
  const { metricMap } = buildEvidenceWeightedMetricMap({
    metrics,
    evidenceValues: latestEvidenceValues,
    evidenceLogs: evidenceLogs30d
  });
  const { average, breakdown } = weightedAverage(metrics, metricMap);

  let score = clamp(average);
  const guardReasons: string[] = [];
  const suggestions: string[] = [];

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
    score: Number(clamp(score).toFixed(2)),
    breakdown,
    guardSummary: guardReasons.join(' '),
    explanation: `Score derived from weighted metrics (${metrics.length}), recency-adjusted evidence weighting, and ${evidenceCount30d} evidence logs in the last 30 days.`,
    suggestions,
    evidenceCount30d
  };
}

export function buildDefaultRecommendations(weakest: Array<{ key: SmvDimensionKey; label: string }>) {
  return weakest.map((item) => {
    if (item.key === 'confidence') return 'Confidence: เดินหน้าผ่านด่านถัดไปให้ได้อีก 1 ด่าน';
    if (item.key === 'look') return 'Look: maintain grooming consistency for 14 days.';
    if (item.key === 'status') return 'Status: sustain 100k+ income for 3 months.';
    if (item.key === 'purpose') return 'Purpose: close one measurable weekly milestone for 4 weeks.';
    return `${item.label}: continue evidence logging to unlock metric set expansion.`;
  });
}
