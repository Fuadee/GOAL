import type { ConstructionProjectBudgetData } from '@/lib/money/types';

export type FinancialRiskLevel = 'low' | 'medium' | 'high';
export type FinancialHealthLevel = 'strong' | 'watch' | 'risk' | 'high_risk';

export type FinancialVariance = {
  key: 'material' | 'labor' | 'other' | 'total';
  label: string;
  planned: number;
  actual: number;
  variance: number;
  variancePercent: number;
  status: 'under' | 'on_plan' | 'over';
};

export type ActiveWorkCostVariance = FinancialVariance & { utilizationPercent: number | null };
export type ActiveWorkCostAnalysis = {
  activeWorkCount: number;
  inProgressCount: number;
  completedCount: number;
  unlinkedExpenseCount: number;
  variances: ActiveWorkCostVariance[];
};

export type AdjustedProjectBudgetAnalysis = {
  originalBudget: number;
  completedWorkPlannedCost: number;
  completedWorkActualCost: number;
  budgetAdjustment: number;
  adjustedBudget: number;
  completedWorkCount: number;
  completedWithoutActualCount: number;
};

export type BurnRateAnalysis = {
  available: boolean;
  daily: number;
  weekly: number;
  monthly: number;
  recentDaily: number;
  previousDaily: number;
  trendPercent: number | null;
};

export type FinancialAnalysis = {
  budget: number;
  actual: number;
  remaining: number;
  progressPercent: number | null;
  healthScore: number;
  healthLevel: FinancialHealthLevel;
  healthReasons: string[];
  forecast: number;
  forecastRemaining: number;
  forecastOverrun: number;
  overrunProbability: number;
  forecastRisk: FinancialRiskLevel;
  forecastConfidence: 'low' | 'medium' | 'high';
  missingData: string[];
  plannedFutureCost: number | null;
  variances: FinancialVariance[];
};

export type FinancialAnalysisInput = ConstructionProjectBudgetData;


