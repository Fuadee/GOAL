export const INCOME_CATEGORIES = ['active', 'building'] as const;
export const INCOME_STATUSES = ['stable', 'unstable', 'building'] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type IncomeStatus = (typeof INCOME_STATUSES)[number];

export type NormalizedIncomeSource = {
  id: string;
  name: string;
  grossAmount: number;
  directCost: number;
  netAmount: number;
  costLabel: string;
  category: IncomeCategory;
  status: IncomeStatus;
  frequency: 'month';
  note: string | null;
};

export function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'string' && value.trim() === '') return 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function normalizeIncomeCategory(value: unknown): IncomeCategory {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === 'building' || raw === 'growing') return 'building';
  return 'active';
}

export function normalizeIncomeStatus(value: unknown): IncomeStatus {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === 'stable' || raw === 'unstable' || raw === 'building') return raw;
  return 'stable';
}

export function normalizeIncomeSource(record: Record<string, unknown>): NormalizedIncomeSource {
  const grossAmount = safeNumber(record.grossAmount ?? record.gross_amount ?? record.amount ?? 0);
  const directCost = safeNumber(record.directCost ?? record.direct_cost ?? 0);
  return {
    id: String(record.id ?? '').trim(),
    name: String(record.name ?? '').trim() || 'Untitled income',
    grossAmount,
    directCost,
    netAmount: safeNumber(grossAmount - directCost),
    costLabel: String(record.costLabel ?? record.cost_label ?? '').trim() || 'ต้นทุน/ดอกเบี้ย',
    category: normalizeIncomeCategory(record.category),
    status: normalizeIncomeStatus(record.status ?? record.stability),
    frequency: 'month',
    note: typeof record.note === 'string' ? record.note : null
  };
}
