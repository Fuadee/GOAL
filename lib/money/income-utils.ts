export const INCOME_CATEGORIES = ['current', 'building', 'future'] as const;
export const INCOME_STATUSES = ['stable', 'unstable', 'building', 'future'] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type IncomeStatus = (typeof INCOME_STATUSES)[number];

export function safeNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function normalizeIncomeCategory(value: unknown): IncomeCategory {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === 'current' || raw === 'real') return 'current';
  if (raw === 'building' || raw === 'growing') return 'building';
  if (raw === 'future') return 'future';
  return 'current';
}

export function normalizeIncomeStatus(value: unknown, fallbackCategory?: IncomeCategory): IncomeStatus {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === 'stable' || raw === 'unstable' || raw === 'building' || raw === 'future') {
    return raw;
  }
  return fallbackCategory === 'future' ? 'future' : 'stable';
}

export function normalizeCountInTotal(value: unknown, category: IncomeCategory): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'on') return true;
  if (value === 'off') return false;
  return category !== 'future';
}
