import { SMV_DIMENSION_LABELS, SMV_FULLY_IMPLEMENTED_DIMENSIONS } from '@/lib/smv/definitions';
import {
  createSmvEvidenceLog,
  createSmvEvidenceMetricValues,
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
  getSmvStageProgress,
  upsertImprovementTask,
  upsertSmvDimensionScore,
  upsertSmvStageProgress
} from '@/lib/smv/repository';
import { buildDefaultRecommendations, calculateSmvDimensionScore } from '@/lib/smv/scoring';
import { SmvDimensionDetail, SmvDimensionKey, SmvDimensionOverview, SmvEvidenceInput } from '@/lib/smv/types';

export async function getConfidenceStages() {
  return getSmvStageDefinitions('confidence');
}

export async function getConfidenceCurrentStage() {
  const [stages, progressRows] = await Promise.all([getConfidenceStages(), getSmvStageProgress('confidence')]);
  const progressMap = new Map(progressRows.map((row) => [row.stage_key, row]));
  const withStatus = stages.map((stage) => {
    const status = progressMap.get(stage.stage_key)?.status ?? 'NOT_STARTED';
    return { ...stage, status };
  });

  const current = withStatus.find((stage) => stage.status !== 'PASSED') ?? withStatus[withStatus.length - 1] ?? null;
  return { current, withStatus };
}

export function getConfidenceScore(passedCount: number) {
  return Math.min(100, Math.max(0, passedCount * 20));
}

export function getConfidenceSummary(passedCount: number) {
  if (passedCount <= 0) return 'คุณกำลังเริ่มต้น สร้างจังหวะการนำให้ชัดเจนทีละด่าน';
  if (passedCount === 1) return 'เริ่มต้นได้แล้ว ต่อไปต้องคุมบทสนทนาให้ต่อเนื่อง';
  if (passedCount === 2) return 'ตอนนี้คุณผ่านช่วงเริ่มต้นแล้ว เหลือการพิสูจน์ตัวเองในสถานการณ์กดดันจริง';
  if (passedCount === 3) return 'ทำได้ดีมาก เหลือการนิ่งเมื่อโดนปฏิเสธและนำคนอื่นให้ได้';
  if (passedCount === 4) return 'ใกล้ครบแล้ว เหลือด่านสุดท้ายคือการเป็นผู้นำที่คนอื่นตามได้';
  return 'ยอดเยี่ยม คุณผ่านครบทุกด่านของแกนความเชื่อมั่นและภาวะผู้นำแล้ว';
}

export function getConfidenceNextAction(currentStage: { action_hint_th: string } | null) {
  return currentStage?.action_hint_th ?? 'รักษามาตรฐานเดิมและช่วยนำผู้อื่นต่อเนื่อง';
}

export async function getConfidenceDetailData() {
  const dimensions = await getSmvDimensions();
  const dimension = dimensions.find((item) => item.key === 'confidence');
  if (!dimension) return null;

  const { current, withStatus } = await getConfidenceCurrentStage();
  const passedCount = withStatus.filter((stage) => stage.status === 'PASSED').length;
  const score = getConfidenceScore(passedCount);
  const stageLabel = current ? `ด่าน ${current.stage_number}: ${current.title_th}` : 'ผ่านครบทุกด่าน';

  await upsertSmvDimensionScore({
    dimension_id: dimension.id,
    score,
    evidence_count_30d: 0,
    guard_summary: `ผ่านแล้ว ${passedCount} จาก ${withStatus.length} ด่าน`,
    explanation: current ? `ด่านปัจจุบัน: ${stageLabel}` : 'ผ่านครบทุกด่านแล้ว'
  });

  return {
    dimension,
    score,
    passedCount,
    totalStages: withStatus.length,
    currentStage: current,
    currentStageLabel: stageLabel,
    summary: getConfidenceSummary(passedCount),
    nextAction: getConfidenceNextAction(current),
    stages: withStatus
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
        explanation: `ด่านปัจจุบัน: ${confidenceDetail.currentStage?.title_th ?? 'ครบทุกด่าน'}`
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
