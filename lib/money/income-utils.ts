export const INCOME_CATEGORIES = ['current', 'building', 'future'] as const;
export const INCOME_STATUSES = ['stable', 'unstable', 'building', 'future'] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type IncomeStatus = (typeof INCOME_STATUSES)[number];

export type NormalizedIncomeSource = {
  id: string;
  name: string;
  grossAmount: number;
  directCost: number;
  netAmount: number;
  category: IncomeCategory;
  status: IncomeStatus;
  countInTotal: boolean;
  note: string | null;
};

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
  if (fallbackCategory === 'future') return 'future';
  if (fallbackCategory === 'building') return 'building';
  return 'stable';
}

export function normalizeCountInTotal(value: unknown, category: IncomeCategory): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'on') return true;
  if (value === 'off') return false;
  return category !== 'future';
}

export function normalizeIncomeSource(record: Record<string, unknown>): NormalizedIncomeSource {
  const id = String(record.id ?? '').trim();
  const category = normalizeIncomeCategory(record.category);
  const grossAmount = safeNumber(record.gross_amount ?? record.grossAmount ?? record.amount ?? record.expected_income ?? record.expected_amount ?? 0);
  const directCost = safeNumber(record.direct_cost ?? record.directCost ?? 0);
  const netAmount = grossAmount - directCost;

  return {
    id,
    name: String(record.name ?? '').trim() || 'Untitled income',
    grossAmount,
    directCost,
    netAmount: Number.isFinite(netAmount) ? netAmount : 0,
    category,
    status: normalizeIncomeStatus(record.status ?? record.stability, category),
    countInTotal: normalizeCountInTotal(record.count_in_total ?? record.countInTotal ?? record.is_counted_in_real_income, category),
    note: typeof record.note === 'string' ? record.note : null
  };
}
