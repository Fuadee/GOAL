import type { ConstructionExpenseRow } from './types';

export const CONSTRUCTION_EXPENSE_TIME_ZONE = 'Asia/Bangkok';

const bangkokDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: CONSTRUCTION_EXPENSE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const expenseDateFormatter = new Intl.DateTimeFormat('th-TH', {
  timeZone: CONSTRUCTION_EXPENSE_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});

const expenseTimeFormatter = new Intl.DateTimeFormat('th-TH', {
  timeZone: CONSTRUCTION_EXPENSE_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function isExpenseDate(value: string | null | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function dateKeyFromTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = bangkokDateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  return year && month && day ? `${year}-${month}-${day}` : '';
}

export function getConstructionExpenseDateKey(expense: ConstructionExpenseRow) {
  return isExpenseDate(expense.expense_date)
    ? expense.expense_date
    : dateKeyFromTimestamp(expense.created_at);
}

export function compareConstructionExpensesNewestFirst(a: ConstructionExpenseRow, b: ConstructionExpenseRow) {
  const dateComparison = getConstructionExpenseDateKey(b).localeCompare(getConstructionExpenseDateKey(a));
  if (dateComparison !== 0) return dateComparison;

  const createdComparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  if (Number.isFinite(createdComparison) && createdComparison !== 0) return createdComparison;

  return b.id.localeCompare(a.id);
}

export function sortConstructionExpensesNewestFirst(expenses: ConstructionExpenseRow[]) {
  return [...expenses].sort(compareConstructionExpensesNewestFirst);
}

export function formatConstructionExpenseDateTime(expense: ConstructionExpenseRow) {
  const createdAt = new Date(expense.created_at);
  const hasCreatedAt = !Number.isNaN(createdAt.getTime());
  const dateKey = getConstructionExpenseDateKey(expense);
  const displayDate = dateKey
    ? expenseDateFormatter.format(new Date(`${dateKey}T00:00:00+07:00`))
    : '-';

  if (!hasCreatedAt) return displayDate;
  return `${displayDate} · ${expenseTimeFormatter.format(createdAt)} น.`;
}
