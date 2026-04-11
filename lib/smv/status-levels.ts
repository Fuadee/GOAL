import { STATUS_LEVELS, StatusLevelDefinition } from '@/src/config/smv-status-levels';

type StatusLevel = StatusLevelDefinition;

function clampPercent(value: number) {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export function validateStatusLevelsInDev() {
  if (process.env.NODE_ENV === 'production') return;

  if (STATUS_LEVELS.length !== 10) {
    throw new Error(`[SMV] STATUS_LEVELS must contain exactly 10 levels, got ${STATUS_LEVELS.length}`);
  }

  const expectedLevels = Array.from({ length: 10 }, (_, index) => index + 1);
  const actualLevels = STATUS_LEVELS.map((level) => level.level).sort((a, b) => a - b);
  const hasAllLevels = expectedLevels.every((level, index) => actualLevels[index] === level);

  if (!hasAllLevels) {
    throw new Error(`[SMV] STATUS_LEVELS must contain level numbers 1-10. Got: ${actualLevels.join(', ')}`);
  }

  const sortedThresholds = STATUS_LEVELS.map((item) => item.income_threshold);
  for (let i = 1; i < sortedThresholds.length; i += 1) {
    if (sortedThresholds[i] <= sortedThresholds[i - 1]) {
      throw new Error('[SMV] STATUS_LEVELS thresholds must be strictly increasing.');
    }
  }

  const uniqueThresholds = new Set(sortedThresholds);
  if (uniqueThresholds.size !== sortedThresholds.length) {
    throw new Error('[SMV] STATUS_LEVELS thresholds must not contain duplicates.');
  }
}

export function getIncomeLevel(monthlyIncome: number): number {
  const income = Number.isFinite(monthlyIncome) ? monthlyIncome : 0;

  if (income >= 1000000) return 10;
  if (income >= 500000) return 9;
  if (income >= 300000) return 8;
  if (income >= 100000) return 7;
  if (income >= 90000) return 6;
  if (income >= 70000) return 5;
  if (income >= 50000) return 4;
  if (income >= 30000) return 3;
  if (income >= 20000) return 2;
  if (income >= 10000) return 1;
  return 0;
}

export function getStatusLevelByLevel(level: number): StatusLevel | null {
  return STATUS_LEVELS.find((item) => item.level === level) ?? null;
}

export function getNextStatusLevel(currentIncome: number) {
  const currentLevelNumber = getIncomeLevel(currentIncome);
  const currentLevel = getStatusLevelByLevel(currentLevelNumber);
  const nextLevel = getStatusLevelByLevel(currentLevelNumber + 1);

  if (currentLevelNumber === 10) {
    return {
      currentLevelNumber,
      currentLevel,
      nextLevel: null,
      currentThreshold: STATUS_LEVELS[STATUS_LEVELS.length - 1].income_threshold,
      nextThreshold: null,
      remainingIncome: 0,
      progressPercent: 100
    };
  }

  const currentThreshold = currentLevel?.income_threshold ?? 0;
  const nextThreshold = nextLevel?.income_threshold ?? STATUS_LEVELS[0].income_threshold;
  const thresholdRange = Math.max(1, nextThreshold - currentThreshold);
  const rawProgress = ((currentIncome - currentThreshold) / thresholdRange) * 100;

  return {
    currentLevelNumber,
    currentLevel,
    nextLevel: nextLevel ?? null,
    currentThreshold,
    nextThreshold,
    remainingIncome: Math.max(0, nextThreshold - currentIncome),
    progressPercent: clampPercent(rawProgress)
  };
}

export function validateStatusLevelResult(monthlyIncome: number, level: number) {
  if (process.env.NODE_ENV === 'production') return;

  if (monthlyIncome >= 100000 && level < 7) {
    throw new Error('[SMV] Income >= 100000 must map to level 7 or higher.');
  }
}
