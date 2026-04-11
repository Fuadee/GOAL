import { SMV_DIMENSION_LABELS, SMV_FULLY_IMPLEMENTED_DIMENSIONS } from '@/lib/smv/definitions';
import { CONFIDENCE_LEVELS, MOCK_CONFIDENCE_LOGS } from '@/lib/smv/confidence-levels';
import {
  createSmvEvidenceLog,
  createSmvEvidenceMetricValues,
  getSmvActionLogs,
  createSmvScoreHistory,
  getSmvDimensionScore,
  getSmvDimensionScores,
  getSmvDimensions,
  getSmvEvidenceLogs,
  getSmvEvidenceLogsSince,
  getSmvEvidenceMetricValuesByEvidenceIds,
  getSmvImprovementTasks,
  getSmvLevelDefinitions,
  getSmvMetrics,
  getSmvStageDefinitions,
  upsertImprovementTask,
  upsertSmvDimensionScore,
  upsertSmvStageProgress
} from '@/lib/smv/repository';
import { buildDefaultRecommendations, calculateSmvDimensionScore } from '@/lib/smv/scoring';
import { SmvActionLogRow, SmvConfidenceLevelDefinition, SmvDimensionDetail, SmvDimensionKey, SmvDimensionOverview, SmvEvidenceInput } from '@/lib/smv/types';

export function getLevelProgress(level: SmvConfidenceLevelDefinition, logs: SmvActionLogRow[]) {
  const count = logs.filter((log) => log.action_type === level.action_type).length;
  const percent = Math.min(100, Math.round((count / level.required_count) * 100));

  return {
    current: count,
    required: level.required_count,
    percent
  };
}

export function getCurrentLevel(levels: SmvConfidenceLevelDefinition[], logs: SmvActionLogRow[]) {
  for (const level of levels) {
    const progress = getLevelProgress(level, logs);
    if (progress.current < progress.required) {
      return level;
    }
  }

  return levels[levels.length - 1];
}

async function getConfidenceLogs() {
  try {
    return await getSmvActionLogs('confidence');
  } catch {
    return MOCK_CONFIDENCE_LOGS.map((log, index) => ({
      id: `mock-confidence-${index + 1}`,
      dimension: 'confidence',
      action_type: log.action_type,
      created_at: new Date().toISOString()
    }));
  }
}

export async function getConfidenceStages() {
  return getSmvStageDefinitions('confidence');
}

export async function getConfidenceDetailData() {
  const dimensions = await getSmvDimensions();
  const dimension = dimensions.find((item) => item.key === 'confidence');
  if (!dimension) return null;

  const levels = CONFIDENCE_LEVELS;
  const logs = await getConfidenceLogs();
  const levelsWithProgress = levels.map((level) => ({ ...level, progress: getLevelProgress(level, logs) }));
  const currentLevel = getCurrentLevel(levels, logs);
  const passedCount = levelsWithProgress.filter((item) => item.progress.current >= item.progress.required).length;
  const currentStageProgress = getLevelProgress(currentLevel, logs);
  const score = Math.round((passedCount / levels.length) * 100);

  await upsertSmvDimensionScore({
    dimension_id: dimension.id,
    score,
    evidence_count_30d: logs.length,
    guard_summary: `ผ่านแล้ว ${passedCount} จาก ${levels.length} ด่าน`,
    explanation: `ด่านปัจจุบัน: ด่าน ${currentLevel.level} ${currentLevel.title}`
  });

  return {
    dimension,
    score,
    passedCount,
    totalStages: levels.length,
    currentStage: currentLevel,
    currentStageLabel: `ด่าน ${currentLevel.level}: ${currentLevel.title}`,
    summary: 'ระบบฝึกความมั่นใจแบบลงมือทำจริงทีละด่าน',
    nextAction: `เก็บ action แบบ ${currentLevel.action_type} เพิ่ม`,
    logs,
    stages: levelsWithProgress,
    currentStageProgress
  };
}

export async function markConfidenceStagePassed(stageKey: string) {
  const stages = await getConfidenceStages();
  const target = stages.find((stage) => stage.stage_key === stageKey);
  if (!target) {
    throw new Error('ไม่พบด่านที่ต้องการอัปเดต');
  }

  await upsertSmvStageProgress({
    dimension_key: 'confidence',
    stage_key: stageKey,
    status: 'PASSED'
  });
}

function getThirtyDaysAgoIso() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 30);
  return date.toISOString();
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
  const confidenceDetail = await getConfidenceDetailData();

  const overview: SmvDimensionOverview[] = dimensions.map((dimension) => {
    if (dimension.key === 'confidence' && confidenceDetail) {
      return {
        dimension,
        score: confidenceDetail.score,
        guardSummary: `ผ่านแล้ว ${confidenceDetail.passedCount} จาก ${confidenceDetail.totalStages} ด่าน`,
        explanation: `ด่านปัจจุบัน: ${confidenceDetail.currentStage?.title ?? 'ครบทุกด่าน'}`
      };
    }

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
  if (key === 'confidence') {
    return null;
  }
  const dimensions = await getSmvDimensions();
  const dimension = dimensions.find((item) => item.key === key);
  if (!dimension) return null;

  const [score, levelDefinitions] = await Promise.all([
    getSmvDimensionScore(dimension.id),
    getSmvLevelDefinitions(dimension.id)
  ]);

  return {
    overview: {
      dimension,
      score: Number(score?.score ?? 0),
      guardSummary: score?.guard_summary ?? 'No guard data yet.',
      explanation: score?.explanation ?? 'Score will appear after first evidence log.'
    },
    levelDefinitions
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
