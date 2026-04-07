export const INCOME_SOURCE_TYPES = ['active', 'passive'] as const;
export const EXPENSE_TYPES = ['fixed', 'variable'] as const;
export const RENTAL_HOUSE_STATUSES = ['planning', 'building', 'active'] as const;

export type IncomeSourceType = (typeof INCOME_SOURCE_TYPES)[number];
export type ExpenseType = (typeof EXPENSE_TYPES)[number];
export type RentalHouseStatus = (typeof RENTAL_HOUSE_STATUSES)[number];

export type IncomeSourceRow = {
  id: string;
  name: string;
  type: IncomeSourceType;
  expected_income: number;
  actual_income: number;
  created_at: string;
};

export type ExpenseRow = {
  id: string;
  category: string;
  amount: number;
  type: ExpenseType;
};

export type RentalHouseRow = {
  id: string;
  name: string;
  status: RentalHouseStatus;
  monthly_income: number;
};

export type MoneyDashboardData = {
  targetIncome: number;
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  progressPercent: number;
  gap: number;
  incomeSources: IncomeSourceRow[];
  expenses: ExpenseRow[];
  rentalHouses: RentalHouseRow[];
};
