export const RENTAL_TARGET_HOUSES = 12;

export const houseStages = [
  'planning',
  'loan_applied',
  'loan_approved',
  'preparing_land',
  'under_construction',
  'ready_to_rent',
  'rented',
  'stable_cashflow'
] as const;

export type HouseStage = (typeof houseStages)[number];

export type RentalHouse = {
  id: string;
  name: string;
  targetOrder: number;
  currentStage: HouseStage;
  budget: number;
  loanAmount: number;
  approvedAmount: number;
  monthlyInstallment: number;
  monthlyRent: number;
  monthlyExpense: number;
  netCashFlow: number;
  startDate: string;
  targetCompleteDate: string;
  note: string;
  lender: string;
  loanSubmittedDate: string;
};

export type StageConfig = {
  label: string;
  description: string;
  badgeClass: string;
};
