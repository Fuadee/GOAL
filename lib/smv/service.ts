import {
  countSmvChecklistLogsByDimensionInRange,
  countSmvChecklistLogsInRange,
  createSmvChecklistLog,
  createSmvScoreEvent,
  getLatestSmvChecklistLogByItemId,
  getSmvChecklistItemById,
  getSmvChecklistItems,
  getSmvChecklistItemsByDimensionId,
  getSmvChecklistLogsByDimensionId,
  getSmvChecklistLogsByItemId,
  getSmvDimensionScoreByDimensionId,
  getSmvDimensionScores,
  getSmvDimensions,
  getSmvScoreEventsByDimensionId,
  upsertSmvDimensionScore
} from '@/lib/smv/repository';
import {
  applyScoreDelta,
  buildFocusNowMessage,
  clampSmvScore,
  getStrongestDimension,
  getTrendDirection,
  getWeakestDimensions
} from '@/lib/smv/scoring';
import {
  CreateChecklistLogInput,
  ManualAdjustDimensionScoreInput,
  SmvDashboardData,
  SmvDimensionWithScore,
  SmvHighlightData,
  SmvScoreEventType
} from '@/lib/smv/types';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getTodayRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const end = new Date(start.getTime() + ONE_DAY_MS - 1);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

function getWeekRange() {
  const now = new Date();
  const utcDay = now.getUTCDay();
  const diffToMonday = utcDay === 0 ? 6 : utcDay - 1;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  monday.setUTCDate(monday.getUTCDate() - diffToMonday);
  return { startIso: monday.toISOString(), endIso: now.toISOString() };
}

function calculateStreakDays(logDates: string[]): number {
  if (logDates.length === 0) {
    return 0;
  }

  const uniqueDays = new Set(logDates.map((d) => d.slice(0, 10)));
  let streak = 0;
  let cursor = new Date();

  while (true) {
    const day = cursor.toISOString().slice(0, 10);
    if (!uniqueDays.has(day)) {
      break;
    }

    streak += 1;
    cursor = new Date(cursor.getTime() - ONE_DAY_MS);
  }

  return streak;
}

export async function getSmvDimensionsWithScores(): Promise<SmvDimensionWithScore[]> {
  const [dimensions, scores] = await Promise.all([getSmvDimensions(), getSmvDimensionScores()]);
  const scoreMap = new Map(scores.map((score) => [score.dimension_id, score]));
  const { startIso: todayStart, endIso: todayEnd } = getTodayRange();
  const { startIso: weekStart, endIso: weekEnd } = getWeekRange();

  const mapped = await Promise.all(
    dimensions.map(async (dimension) => {
      const scoreRow = scoreMap.get(dimension.id);
      const currentScore = scoreRow?.current_score ?? 50;
      const previousScore = scoreRow?.previous_score ?? 50;
      const [todayCompletedCount, weeklyCompletedCount, logs] = await Promise.all([
        countSmvChecklistLogsByDimensionInRange(dimension.id, todayStart, todayEnd),
        countSmvChecklistLogsByDimensionInRange(dimension.id, weekStart, weekEnd),
        getSmvChecklistLogsByDimensionId(dimension.id, 30)
      ]);

      return {
        id: dimension.id,
        key: dimension.key,
        label: dimension.label,
        description: dimension.description,
        colorToken: dimension.color_token,
        currentScore,
        previousScore,
        trend: getTrendDirection(currentScore, previousScore),
        todayCompletedCount,
        weeklyCompletedCount,
        streakDays: calculateStreakDays(logs.map((log) => log.completed_at))
      };
    })
  );

  return mapped;
}

export async function getSmvChecklistItemsByDimension(): Promise<Record<string, Awaited<ReturnType<typeof getSmvChecklistItems>>>> {
  const items = await getSmvChecklistItems();
  return items.reduce<Record<string, Awaited<ReturnType<typeof getSmvChecklistItems>>>>((acc, item) => {
    const key = item.dimension_id;
    acc[key] = [...(acc[key] ?? []), item];
    return acc;
  }, {});
}

export async function getSmvScoreHistory(dimensionId: string, filter: 'all' | SmvScoreEventType = 'all') {
  if (filter === 'all') {
    return getSmvScoreEventsByDimensionId(dimensionId, 20);
  }

  return getSmvScoreEventsByDimensionId(dimensionId, 20, filter);
}

export async function getSmvHighlights(): Promise<SmvHighlightData> {
  const dimensions = await getSmvDimensionsWithScores();
  const strongestDimension = getStrongestDimension(dimensions);
  const weakestTwo = getWeakestDimensions(dimensions, 2);
  const strongestTwo = [...dimensions].sort((a, b) => b.currentScore - a.currentScore).slice(0, 2);
  const averageScore =
    dimensions.length > 0
      ? Math.round(dimensions.reduce((total, dimension) => total + dimension.currentScore, 0) / dimensions.length)
      : 0;

  return {
    averageScore,
    strongestDimension,
    weakestDimension: weakestTwo[0] ?? null,
    strongestTwo,
    weakestTwo,
    focusNowMessage: buildFocusNowMessage(weakestTwo),
    aiRecommendationPlaceholder: 'AI coaching recommendation slot (future-ready).'
  };
}

async function ensureDimensionScore(dimensionId: string) {
  const existing = await getSmvDimensionScoreByDimensionId(dimensionId);
  if (existing) {
    return existing;
  }

  return upsertSmvDimensionScore({
    dimension_id: dimensionId,
    current_score: 50,
    previous_score: 50
  });
}

function isSameUtcDate(a: string, b: Date) {
  const dayA = a.slice(0, 10);
  const dayB = b.toISOString().slice(0, 10);
  return dayA === dayB;
}

async function validateFrequency(checklistItemId: string, frequencyType: 'daily' | 'repeatable' | 'one_time') {
  if (frequencyType === 'repeatable') {
    return;
  }

  if (frequencyType === 'daily') {
    const latest = await getLatestSmvChecklistLogByItemId(checklistItemId);
    if (latest && isSameUtcDate(latest.completed_at, new Date())) {
      throw new Error('This daily checklist item has already been completed today.');
    }
    return;
  }

  const oneTimeLogs = await getSmvChecklistLogsByItemId(checklistItemId);
  if (oneTimeLogs.length > 0) {
    throw new Error('This one-time checklist item has already been completed.');
  }
}

export async function createChecklistLogAndApplyScore(input: CreateChecklistLogInput) {
  const checklistItem = await getSmvChecklistItemById(input.checklistItemId);

  if (!checklistItem || !checklistItem.is_active) {
    throw new Error('Checklist item not found or inactive.');
  }

  if (checklistItem.dimension_id !== input.dimensionId) {
    throw new Error('Checklist item does not belong to this dimension.');
  }

  await validateFrequency(checklistItem.id, checklistItem.frequency_type);

  const currentScoreRow = await ensureDimensionScore(input.dimensionId);
  const scoreBefore = currentScoreRow.current_score;
  const scoreAfter = applyScoreDelta(scoreBefore, checklistItem.score_delta);

  const checklistLog = await createSmvChecklistLog({
    dimension_id: input.dimensionId,
    checklist_item_id: checklistItem.id,
    notes: input.notes
  });

  await createSmvScoreEvent({
    dimension_id: input.dimensionId,
    event_type: 'checklist',
    score_before: scoreBefore,
    score_delta: checklistItem.score_delta,
    score_after: scoreAfter,
    reason: checklistItem.title,
    checklist_log_id: checklistLog.id
  });

  await upsertSmvDimensionScore({
    dimension_id: input.dimensionId,
    previous_score: scoreBefore,
    current_score: scoreAfter
  });

  return { checklistLogId: checklistLog.id, scoreBefore, scoreAfter };
}

export async function manuallyAdjustDimensionScore(input: ManualAdjustDimensionScoreInput) {
  const currentScoreRow = await ensureDimensionScore(input.dimensionId);
  const scoreBefore = currentScoreRow.current_score;
  const scoreAfter = clampSmvScore(input.newScore);
  const scoreDelta = scoreAfter - scoreBefore;

  await createSmvScoreEvent({
    dimension_id: input.dimensionId,
    event_type: 'manual_adjustment',
    score_before: scoreBefore,
    score_delta: scoreDelta,
    score_after: scoreAfter,
    reason: input.reason
  });

  await upsertSmvDimensionScore({
    dimension_id: input.dimensionId,
    previous_score: scoreBefore,
    current_score: scoreAfter
  });

  return { scoreBefore, scoreAfter };
}

export async function getSmvDashboardData(selectedDimensionId?: string): Promise<SmvDashboardData> {
  const dimensions = await getSmvDimensionsWithScores();
  const selected = selectedDimensionId ?? dimensions[0]?.id ?? '';
  const [checklistItemsByDimension, highlights, todayCompletedCount, weeklyCompletedCount] = await Promise.all([
    getSmvChecklistItemsByDimension(),
    getSmvHighlights(),
    countSmvChecklistLogsInRange(getTodayRange().startIso, getTodayRange().endIso),
    countSmvChecklistLogsInRange(getWeekRange().startIso, getWeekRange().endIso)
  ]);

  const recentLogsByDimension = Object.fromEntries(
    await Promise.all(
      dimensions.map(async (dimension) => [dimension.id, await getSmvChecklistLogsByDimensionId(dimension.id, 6)] as const)
    )
  );

  const selectedDimensionHistory = selected ? await getSmvScoreHistory(selected) : [];

  return {
    dimensions,
    checklistItemsByDimension,
    recentLogsByDimension,
    selectedDimensionHistory,
    highlights,
    activity: {
      todayCompletedCount,
      weeklyCompletedCount
    }
  };
}

export async function getSmvChecklistItemsByDimensionKey(dimensionId: string) {
  return getSmvChecklistItemsByDimensionId(dimensionId);
}
