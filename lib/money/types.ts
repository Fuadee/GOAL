export const INCOME_SOURCE_TYPES = ['active', 'passive'] as const;
export const EXPENSE_TYPES = ['fixed', 'variable'] as const;
export const RENTAL_HOUSE_STATUSES = ['planning', 'building', 'active'] as const;
export const MONEY_GOAL_PLAN_STATUSES = ['planned', 'in_progress', 'completed'] as const;
export const CONSTRUCTION_STEP_STATUSES = ['not_started', 'in_progress', 'waiting', 'blocked', 'completed'] as const;

export type IncomeSourceType = (typeof INCOME_SOURCE_TYPES)[number];
export type ExpenseType = (typeof EXPENSE_TYPES)[number];
export type RentalHouseStatus = (typeof RENTAL_HOUSE_STATUSES)[number];
export type MoneyGoalPlanStatus = (typeof MONEY_GOAL_PLAN_STATUSES)[number];
export type ConstructionStepStatus = (typeof CONSTRUCTION_STEP_STATUSES)[number];

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

export type MoneyGoalPlanRow = {
  id: string;
  plan_name: string;
  net_increase: number;
  status: MoneyGoalPlanStatus;
  created_at: string;
  updated_at: string;
};

export type ConstructionStepRow = {
  id: string;
  step_name: string;
  step_order: number;
  status: ConstructionStepStatus;
  target_date: string | null;
  latest_update: string | null;
  is_completed: boolean;
  completed_at: string | null;
};


export type ConstructionMilestoneViewStatus = 'done' | 'current' | 'upcoming' | 'blocked';

export type ConstructionMilestoneView = {
  id: string;
  order: number;
  title: string;
  status: ConstructionMilestoneViewStatus;
  targetDateLabel: string;
};

export type ConstructionFocusView = {
  currentStep: string;
  progressLabel: string;
  nextMilestone: string;
  targetDateLabel: string;
  latestUpdate: string;
};

export type ConstructionMetricView = {
  label: string;
  value: string;
};

export type StepUpdateRow = {
  id: string;
  step_id: string;
  message: string;
  created_at: string;
};

export type IncomeSummary = {
  count: number;
  totalExpected: number;
  totalActual: number;
};

export type ExpenseSummary = {
  count: number;
  totalAmount: number;
};

export type MoneyDashboardData = {
  targetIncome: number;
  grossIncome: number;
  totalExpense: number;
  netIncome: number;
  progressPercent: number;
  gap: number;
  incomeSummary: IncomeSummary;
  expenseSummary: ExpenseSummary;
};

export type IncomeManagementPageData = {
  incomeSources: IncomeSourceRow[];
};

export type ExpenseManagementPageData = {
  expenses: ExpenseRow[];
};

export type MoneyPlanPageData = {
  targetIncome: number;
  currentNet: number;
  plannedIncrease: number;
  projectedNet: number;
  remainingGap: number;
  plans: MoneyGoalPlanRow[];
};
