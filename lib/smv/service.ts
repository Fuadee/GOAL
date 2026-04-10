import { SMV_DIMENSION_LABELS, SMV_FULLY_IMPLEMENTED_DIMENSIONS } from '@/lib/smv/definitions';
import {
  createSmvEvidenceLog,
  createSmvEvidenceMetricValues,
  createSmvScoreHistory,
  getLatestMetricValuesForDimension,
  getSmvDimensionScore,
  getSmvDimensionScores,
  getSmvDimensions,
  getSmvEvidenceLogs,
  getSmvEvidenceLogsSince,
  getSmvEvidenceMetricValuesByEvidenceIds,
  getSmvImprovementTasks,
  getSmvLevelDefinitions,
  getSmvMetrics,
  getSmvScoreHistory,
  upsertImprovementTask,
  upsertSmvDimensionScore
} from '@/lib/smv/repository';
import { buildDefaultRecommendations, calculateSmvDimensionScore } from '@/lib/smv/scoring';
import { SmvDimensionDetail, SmvDimensionKey, SmvDimensionOverview, SmvEvidenceInput, SmvMetricRow } from '@/lib/smv/types';

function getThirtyDaysAgoIso() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 30);
  return date.toISOString();
}

function pickLatestValueByMetric(metricRows: SmvMetricRow[], rawValues: Awaited<ReturnType<typeof getLatestMetricValuesForDimension>>) {
  return metricRows
    .map((metric) => ({
      ...metric,
      latestValue: rawValues.find((item) => item.metric_id === metric.id)?.numeric_value ?? null
    }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function recalculateDimensionScore(dimensionId: string) {
  const dimensions = await getSmvDimensions();
  const dimension = dimensions.find((item) => item.id === dimensionId);

  if (!dimension) {
    throw new Error('Dimension not found.');
  }

  const metrics = await getSmvMetrics(dimensionId);
  const logs30d = await getSmvEvidenceLogsSince(dimensionId, getThirtyDaysAgoIso());
  const logIds = logs30d.map((item) => item.id);
  const metricValues = await getSmvEvidenceMetricValuesByEvidenceIds(logIds);

  const result = calculateSmvDimensionScore({
    dimensionKey: dimension.key,
    metrics,
    latestEvidenceValues: metricValues,
    evidenceLogs30d: logs30d
  });

  await upsertSmvDimensionScore({
    dimension_id: dimensionId,
    score: result.score,
    evidence_count_30d: result.evidenceCount30d,
    guard_summary: result.guardSummary,
    explanation: result.explanation
  });

  await createSmvScoreHistory({
    dimension_id: dimensionId,
    score: result.score,
    evidence_count_30d: result.evidenceCount30d,
    guard_summary: result.guardSummary,
    explanation: result.explanation,
    score_breakdown: result.breakdown
  });

  for (const suggestion of result.suggestions.slice(0, 2)) {
    await upsertImprovementTask({
      dimension_id: dimensionId,
      title: suggestion,
      priority: 2,
      description: 'Auto-generated from score guard and evidence gaps.',
      requirement: { generated_by: 'recalculateDimensionScore' }
    });
  }

  return result;
}

export async function createEvidenceAndRecalculate(input: SmvEvidenceInput) {
  const evidence = await createSmvEvidenceLog({
    dimension_id: input.dimensionId,
    context: input.context,
    note: input.note
  });

  await createSmvEvidenceMetricValues(evidence.id, input.metricValues);
  await recalculateDimensionScore(input.dimensionId);
}

export async function getSmvOverviewData() {
  const [dimensions, scores, latestLogs] = await Promise.all([getSmvDimensions(), getSmvDimensionScores(), getSmvEvidenceLogs(undefined, 8)]);
  const scoreMap = new Map(scores.map((item) => [item.dimension_id, item]));

  const overview: SmvDimensionOverview[] = dimensions.map((dimension) => {
    const score = scoreMap.get(dimension.id);
    return {
      dimension,
      score: Number(score?.score ?? 0),
      guardSummary: score?.guard_summary ?? 'ยังไม่มีหลักฐานเพียงพอ',
      explanation: score?.explanation ?? 'เริ่มบันทึกหลักฐานเพื่อคำนวณคะแนน'
    };
  });

  const sorted = [...overview].sort((a, b) => b.score - a.score);
  const strongest = sorted.slice(0, 3);
  const weakest = [...sorted].reverse().slice(0, 3);
  const recommendedActions = buildDefaultRecommendations(weakest.map((item) => ({ key: item.dimension.key, label: item.dimension.label })));

  return {
    dimensions: overview,
    strongest,
    weakest,
    latestLogs,
    recommendedActions,
    averageScore: overview.length ? Math.round(overview.reduce((sum, item) => sum + item.score, 0) / overview.length) : 0
  };
}

export async function getSmvDimensionDetailByKey(key: SmvDimensionKey): Promise<SmvDimensionDetail | null> {
  const dimensions = await getSmvDimensions();
  const dimension = dimensions.find((item) => item.key === key);
  if (!dimension) return null;

  const [score, metrics, levelDefinitions, history, recentEvidence] = await Promise.all([
    getSmvDimensionScore(dimension.id),
    getSmvMetrics(dimension.id),
    getSmvLevelDefinitions(dimension.id),
    getSmvScoreHistory(dimension.id),
    getSmvEvidenceLogs(dimension.id, 10)
  ]);

  const evidenceIds = recentEvidence.map((item) => item.id);
  const evidenceValues = await getSmvEvidenceMetricValuesByEvidenceIds(evidenceIds);
  const valuesByEvidence = evidenceIds.reduce<Record<string, typeof evidenceValues>>((acc, id) => {
    acc[id] = evidenceValues.filter((item) => item.evidence_log_id === id);
    return acc;
  }, {});

  const latestValues = await getLatestMetricValuesForDimension(metrics.map((item) => item.id));
  const metricRows = pickLatestValueByMetric(metrics, latestValues);

  const latestBreakdown = history[0]?.score_breakdown ?? {};
  const weakestKeys = Object.entries(latestBreakdown)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map((entry) => entry[0]);

  const suggestions = weakestKeys.length
    ? weakestKeys.map((metric) => `Increase ${metric} evidence quality over the next 14 days.`)
    : ['Add more evidence logs to unlock metric-level coaching.'];

  return {
    overview: {
      dimension,
      score: Number(score?.score ?? 0),
      guardSummary: score?.guard_summary ?? 'No guard data yet.',
      explanation: score?.explanation ?? 'Score will appear after first evidence log.'
    },
    metrics: metricRows,
    levelDefinitions,
    history,
    recentEvidence: recentEvidence.map((item) => ({
      ...item,
      values: valuesByEvidence[item.id] ?? []
    })),
    breakdown: latestBreakdown,
    suggestions
  };
}

export async function getSmvLogPageData() {
  const dimensions = await getSmvDimensions();
  const metrics = await getSmvMetrics();

  return {
    dimensions,
    metricsByDimension: dimensions.reduce<Record<string, SmvMetricRow[]>>((acc, dimension) => {
      acc[dimension.id] = metrics.filter((metric) => metric.dimension_id === dimension.id);
      return acc;
    }, {}),
    implementedDimensionLabels: SMV_FULLY_IMPLEMENTED_DIMENSIONS.map((key) => SMV_DIMENSION_LABELS[key])
  };
}

export async function getSmvPlanData() {
  const [tasks, overview] = await Promise.all([getSmvImprovementTasks(), getSmvOverviewData()]);
  const byDimension = overview.dimensions.reduce<Record<string, string>>((acc, item) => {
    acc[item.dimension.id] = item.dimension.label;
    return acc;
  }, {});

  return {
    tasks,
    fallbackRecommendations: overview.recommendedActions,
    dimensionLabelById: byDimension
  };
}
