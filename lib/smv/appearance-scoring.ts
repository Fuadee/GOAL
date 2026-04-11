import {
  APPEARANCE_CATEGORIES,
  APPEARANCE_CATEGORY_KEYS,
  APPEARANCE_TOTAL_SCORE,
  AppearanceCategoryDefinition,
  AppearanceCategoryKey
} from '@/lib/smv/appearance-config';

export type AppearanceProgressRow = {
  category_key: AppearanceCategoryKey;
  unlocked_level: number;
  note: string | null;
  evidence_count: number;
  updated_at: string;
};

export type AppearanceCategoryProgress = {
  category: AppearanceCategoryDefinition;
  unlockedLevel: number;
  currentLevel: number;
  score: number;
  maxScore: number;
  progressPercent: number;
  nextLevel: number | null;
  nextLevelTitle: string | null;
  nextTarget: string;
  note: string | null;
  evidenceCount: number;
};

function clampLevel(level: number, maxLevel: number) {
  return Math.max(0, Math.min(maxLevel, Math.floor(level)));
}

export function getAppearanceCategoryLevel(categoryKey: AppearanceCategoryKey, unlockedLevel: number) {
  const maxLevel = APPEARANCE_CATEGORIES[categoryKey].levels.length;
  return clampLevel(unlockedLevel, maxLevel);
}

export function getAppearanceCategoryScore(categoryKey: AppearanceCategoryKey, unlockedLevel: number) {
  const category = APPEARANCE_CATEGORIES[categoryKey];
  const level = getAppearanceCategoryLevel(categoryKey, unlockedLevel);
  return Math.min(level * 10, category.maxScore);
}

export function getNextAppearanceLevel(categoryKey: AppearanceCategoryKey, unlockedLevel: number) {
  const category = APPEARANCE_CATEGORIES[categoryKey];
  const current = getAppearanceCategoryLevel(categoryKey, unlockedLevel);
  if (current >= category.levels.length) return null;
  return current + 1;
}

export function isAppearanceLevelUnlocked(categoryKey: AppearanceCategoryKey, unlockedLevel: number, level: number) {
  return getAppearanceCategoryLevel(categoryKey, unlockedLevel) >= level;
}

export function getAppearanceTotalScore(progressRows: AppearanceProgressRow[]) {
  const score = APPEARANCE_CATEGORY_KEYS.reduce((sum, key) => {
    const row = progressRows.find((item) => item.category_key === key);
    return sum + getAppearanceCategoryScore(key, row?.unlocked_level ?? 0);
  }, 0);

  return Math.max(0, Math.min(APPEARANCE_TOTAL_SCORE, score));
}

export function buildAppearanceProgressSummary(progressRows: AppearanceProgressRow[]): AppearanceCategoryProgress[] {
  return APPEARANCE_CATEGORY_KEYS.map((key) => {
    const category = APPEARANCE_CATEGORIES[key];
    const row = progressRows.find((item) => item.category_key === key);
    const unlockedLevel = getAppearanceCategoryLevel(key, row?.unlocked_level ?? 0);
    const score = getAppearanceCategoryScore(key, unlockedLevel);
    const nextLevel = getNextAppearanceLevel(key, unlockedLevel);
    const nextLevelDefinition = nextLevel ? category.levels.find((level) => level.level === nextLevel) : null;

    return {
      category,
      unlockedLevel,
      currentLevel: unlockedLevel,
      score,
      maxScore: category.maxScore,
      progressPercent: (score / category.maxScore) * 100,
      nextLevel,
      nextLevelTitle: nextLevelDefinition?.title ?? null,
      nextTarget: nextLevelDefinition?.description ?? 'ผ่านครบทุกด่านแล้ว รักษามาตรฐานต่อเนื่อง',
      note: row?.note ?? null,
      evidenceCount: row?.evidence_count ?? 0
    };
  });
}
