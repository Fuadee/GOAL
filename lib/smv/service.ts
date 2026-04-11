import { SMV_DIMENSION_LABELS, SMV_FULLY_IMPLEMENTED_DIMENSIONS } from '@/lib/smv/definitions';
import { getConfidenceLevels, validateConfidenceLevelsInDev } from '@/lib/smv/confidence-levels';
import { STATUS_LEVELS } from '@/src/config/smv-status-levels';
import {
  getIncomeLevel,
  getIncomeOverviewScore,
  getIncomeProgressToNextLevel,
  getStatusLevelByLevel,
  validateStatusLevelResult,
  validateStatusLevelsInDev
} from '@/lib/smv/status-levels';
import { getSmvOverviewDimensions } from '@/lib/smv/progression-config';
import {
  createSmvEvidenceLog,
  createSmvEvidenceMetricValues,
  getSmvActionLogs,
  getLatestMetricValuesForDimension,
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
import {
  SmvActionLogRow,
  SmvConfidenceLevelDefinition,
  SmvDimensionDetail,
  SmvDimensionKey,
  SmvDimensionOverview,
  SmvDimensionRow,
  SmvEvidenceInput,
  SmvMetricRow,
  SMV_DIMENSION_KEYS
} from '@/lib/smv/types';

const LEGACY_DIMENSION_KEY_MAP: Record<string, SmvDimensionKey> = {
  fun: 'social',
  preselection: 'social',
  purpose: 'status',
  protection: 'status'
};

const POWER_SUMMARY_BY_KEY: Record<SmvDimensionKey, string> = {
  confidence: 'ยังไม่มั่นคงเวลาคุยกับคนแปลกหน้า',
  look: 'ภาพลักษณ์โดยรวมเริ่มดีขึ้น',
  status: 'มีฐานะบางส่วน แต่ยังไม่เด่นพอ',
  social: 'เริ่มมีคนรู้จัก แต่เครือข่ายยังไม่แน่น'
};

function toCoreDimensionKey(rawKey: string): SmvDimensionKey | null {
  if ((SMV_DIMENSION_KEYS as readonly string[]).includes(rawKey)) return rawKey as SmvDimensionKey;
  return LEGACY_DIMENSION_KEY_MAP[rawKey] ?? null;
}

function mergeLegacyDimensions(rows: SmvDimensionRow[]): SmvDimensionRow[] {
  const selectedByCore = new Map<SmvDimensionKey, SmvDimensionRow>();

  for (const row of rows) {
    const mapped = toCoreDimensionKey(row.key);
    if (!mapped) continue;
    if (!selectedByCore.has(mapped)) {
      selectedByCore.set(mapped, { ...row, key: mapped, label: SMV_DIMENSION_LABELS[mapped] });
      continue;
    }

    const existing = selectedByCore.get(mapped)!;
    if (row.key === mapped && existing.key !== mapped) {
      selectedByCore.set(mapped, { ...row, key: mapped, label: SMV_DIMENSION_LABELS[mapped] });
    }
  }

  return SMV_DIMENSION_KEYS.map((key) => selectedByCore.get(key)).filter((item): item is SmvDimensionRow => Boolean(item));
}

export function getPowerLevelLabel(score: number) {
  if (score <= 24) return 'อ่อน';
  if (score <= 49) return 'กำลังก่อตัว';
  if (score <= 74) return 'แข็งแรง';
  return 'โดดเด่น';
}

export function getConfidenceProgress(level: SmvConfidenceLevelDefinition, logs: SmvActionLogRow[]) {
  const count = logs.filter((log) => log.dimension === 'confidence' && log.action_type === level.action_type).length;

  return {
    current: count,
    required: level.required_count,
    percent: Math.min((count / level.required_count) * 100, 100)
  };
}

export function getCurrentConfidenceLevel(levels: SmvConfidenceLevelDefinition[], logs: SmvActionLogRow[]) {
  for (const level of levels) {
    const progress = getConfidenceProgress(level, logs);
    if (progress.current < progress.required) {
      return { level, allCompleted: false };
    }
  }

  return { level: levels[levels.length - 1], allCompleted: true };
}

async function getConfidenceLogs() {
  try {
    return await getSmvActionLogs('confidence');
  } catch {
    return [];
  }
}

export async function getConfidenceStages() {
  return getSmvStageDefinitions('confidence');
}

export async function getConfidenceDetailData() {
  const dimensions = mergeLegacyDimensions(await getSmvDimensions());
  const dimension = dimensions.find((item) => item.key === 'confidence');
  if (!dimension) return null;

  validateConfidenceLevelsInDev();
  const levels = getConfidenceLevels();
  const logs = await getConfidenceLogs();
  const levelsWithProgress = levels.map((level) => ({ ...level, progress: getConfidenceProgress(level, logs) }));
  const { level: currentLevel, allCompleted } = getCurrentConfidenceLevel(levels, logs);
  const passedCount = levelsWithProgress.filter((item) => item.progress.current >= item.progress.required).length;
  const currentStageProgress = getConfidenceProgress(currentLevel, logs);
  const score = Math.round((passedCount / levels.length) * 100);

  await upsertSmvDimensionScore({
    dimension_id: dimension.id,
    score,
    evidence_count_30d: logs.length,
    guard_summary: `Progress ${passedCount}/${levels.length}`,
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
    currentStageProgress,
    allCompleted
  };
}


export async function getStatusDetailData() {
  const dimensions = mergeLegacyDimensions(await getSmvDimensions());
  const dimension = dimensions.find((item) => item.key === 'status');
  if (!dimension) return null;

  validateStatusLevelsInDev();

  const metrics = await getSmvMetrics(dimension.id);
  const incomeMetric = metrics.find((metric) => metric.key === 'income_level');

  let monthlyIncome = 0;
  if (incomeMetric) {
    const latestValues = await getLatestMetricValuesForDimension([incomeMetric.id]);
    monthlyIncome = Number(latestValues.find((value) => value.metric_id === incomeMetric.id)?.numeric_value ?? 0);
  }

  const currentLevelNumber = getIncomeLevel(monthlyIncome);
  validateStatusLevelResult(monthlyIncome, currentLevelNumber);

  const progression = getIncomeProgressToNextLevel(monthlyIncome);

  return {
    dimension,
    monthlyIncome,
    currentLevelNumber,
    currentLevel: getStatusLevelByLevel(currentLevelNumber),
    nextLevel: progression.nextLevel,
    progressPercent: progression.progressPercent,
    remainingIncome: progression.remainingIncome,
    currentThreshold: progression.currentThreshold,
    nextThreshold: progression.nextThreshold,
    levels: STATUS_LEVELS
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
  const dimensions = mergeLegacyDimensions(await getSmvDimensions());
  const dimension = dimensions.find((item) => item.id === dimensionId);

  if (!dimension) {
    throw new Error('Dimension not found.');
  }

  const metrics = await getSmvMetrics(dimensionId);
  const logs30d = await getSmvEvidenceLogsSince(dimensionId, getThirtyDaysAgoIso());
  const logIds = logs30d.map((item) => item.id);
  const metricValues = await getSmvEvidenceMetricValuesByEvidenceIds(logIds);

  const dimensionKey = toCoreDimensionKey(dimension.key);
  if (!dimensionKey) {
    throw new Error('Unsupported dimension key.');
  }

  const result = calculateSmvDimensionScore({
    dimensionKey,
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

function combineScoresByDimension(input: { dimensions: SmvDimensionRow[]; overview: SmvDimensionOverview[] }) {
  const bestByKey = new Map<SmvDimensionKey, SmvDimensionOverview>();

  for (const item of input.overview) {
    const mapped = toCoreDimensionKey(item.dimension.key);
    if (!mapped) continue;

    const current = bestByKey.get(mapped);
    if (!current || item.score > current.score || item.dimension.key === mapped) {
      bestByKey.set(mapped, {
        ...item,
        dimension: {
          ...item.dimension,
          key: mapped,
          label: SMV_DIMENSION_LABELS[mapped]
        },
        explanation: POWER_SUMMARY_BY_KEY[mapped]
      });
    }
  }

  return SMV_DIMENSION_KEYS.map((key) => bestByKey.get(key)).filter((item): item is SmvDimensionOverview => Boolean(item));
}

export async function getSmvOverviewData() {
  const [rawDimensions, scores, latestLogs] = await Promise.all([getSmvDimensions(), getSmvDimensionScores(), getSmvEvidenceLogs(undefined, 8)]);
  const dimensions = mergeLegacyDimensions(rawDimensions);
  const scoreMap = new Map(scores.map((item) => [item.dimension_id, item]));
  const confidenceDetail = await getConfidenceDetailData();
  const statusDetail = await getStatusDetailData();

  const overview: SmvDimensionOverview[] = dimensions.map((dimension) => {
    if (dimension.key === 'confidence' && confidenceDetail) {
      return {
        dimension,
        score: confidenceDetail.score,
        guardSummary: 'ระบบกำลังติดตามพัฒนาการตามด่าน',
        explanation: POWER_SUMMARY_BY_KEY.confidence
      };
    }
    if (dimension.key === 'status' && statusDetail) {
      return {
        dimension,
        score: getIncomeOverviewScore(statusDetail.monthlyIncome),
        guardSummary: `Level ${statusDetail.currentLevelNumber}`,
        explanation: POWER_SUMMARY_BY_KEY.status
      };
    }

    const score = scoreMap.get(dimension.id);
    const mappedKey = toCoreDimensionKey(dimension.key as string);
    return {
      dimension,
      score: Number(score?.score ?? 0),
      guardSummary: score?.guard_summary ?? 'ยังไม่มีหลักฐานเพียงพอ',
      explanation: mappedKey ? POWER_SUMMARY_BY_KEY[mappedKey] : 'เริ่มบันทึกหลักฐานเพื่อคำนวณคะแนน'
    };
  });

  const mergedOverview = combineScoresByDimension({ dimensions, overview });
  const overviewDimensionKeys = new Set(getSmvOverviewDimensions().map((item) => item.dimensionKey));
  const scopedOverview = mergedOverview.filter((item) => overviewDimensionKeys.has(item.dimension.key as SmvDimensionKey));
  const sorted = [...scopedOverview].sort((a, b) => b.score - a.score);
  const strongest = sorted.slice(0, 1);
  const weakest = [...sorted].reverse().slice(0, 1);
  const recommendedActions = buildDefaultRecommendations(weakest.map((item) => ({ key: item.dimension.key as SmvDimensionKey, label: item.dimension.label })));

  return {
    dimensions: scopedOverview,
    strongest,
    weakest,
    latestLogs,
    recommendedActions,
    averageScore: scopedOverview.length ? Math.round(scopedOverview.reduce((sum, item) => sum + item.score, 0) / scopedOverview.length) : 0
  };
}

export async function getSmvDimensionDetailByKey(key: SmvDimensionKey): Promise<SmvDimensionDetail | null> {
  if (key === 'confidence') {
    return null;
  }

  const dimensions = mergeLegacyDimensions(await getSmvDimensions());
  const dimension = dimensions.find((item) => item.key === key);
  if (!dimension) return null;

  const [score, levelDefinitions] = await Promise.all([getSmvDimensionScore(dimension.id), getSmvLevelDefinitions(dimension.id)]);

  return {
    overview: {
      dimension,
      score: Number(score?.score ?? 0),
      guardSummary: score?.guard_summary ?? 'No guard data yet.',
      explanation: POWER_SUMMARY_BY_KEY[key]
    },
    levelDefinitions
  };
}

export async function getSmvLogPageData() {
  const dimensions = mergeLegacyDimensions(await getSmvDimensions());
  const metrics = await getSmvMetrics();

  const allowedDimensionIds = new Set(dimensions.map((item) => item.id));

  return {
    dimensions,
    metricsByDimension: dimensions.reduce<Record<string, SmvMetricRow[]>>((acc, dimension) => {
      acc[dimension.id] = metrics.filter((metric) => metric.dimension_id === dimension.id && allowedDimensionIds.has(metric.dimension_id));
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
    tasks: tasks.filter((task) => Boolean(byDimension[task.dimension_id])),
    fallbackRecommendations: overview.recommendedActions,
    dimensionLabelById: byDimension
  };
}
