import type { ConstructionCategoryRow, ConstructionExpenseRow } from '@/lib/money/types';
import type { ActiveWorkCostAnalysis, ActiveWorkCostVariance, AdjustedProjectBudgetAnalysis, BurnRateAnalysis, FinancialAnalysis, FinancialAnalysisInput, FinancialHealthLevel, FinancialRiskLevel, FinancialVariance } from '@/types/financial-analysis';

const safeNumber = (value: unknown) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
};
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);
const sum = (values: number[]) => values.reduce((total, value) => total + safeNumber(value), 0);
const expenseTotal = (expenses: ConstructionExpenseRow[], type?: 'material' | 'labor') => sum(expenses.filter((expense) => !type || expense.cost_type === type).map((expense) => expense.amount));
const money = (value: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(safeNumber(value));

function getProgress(categories: ConstructionCategoryRow[]) {
  if (!categories.length) return null;
  const weights = { not_started: 0, in_progress: 50, completed: 100 } as const;
  return sum(categories.map((category) => {
    const checklist = Array.isArray(category.operation_checklist) ? category.operation_checklist : [];
    return checklist.length ? (checklist.filter((item) => item.done).length / checklist.length) * 100 : weights[category.status] ?? 0;
  })) / categories.length;
}

export function calculatePlanActualVariance(input: FinancialAnalysisInput): FinancialVariance[] {
  const materialPlanned = sum(input.categories.map((category) => category.budget));
  const laborPlanned = sum(input.categories.map((category) => category.labor_budget));
  const categorizedExpenses = input.expenses.filter((expense) => Boolean(expense.category_id));
  const materialActual = expenseTotal(categorizedExpenses, 'material');
  const laborActual = expenseTotal(categorizedExpenses, 'labor');
  const otherActual = expenseTotal(input.expenses.filter((expense) => !expense.category_id));
  const create = (key: FinancialVariance['key'], label: string, planned: number, actual: number): FinancialVariance => {
    const variance = actual - planned;
    const variancePercent = planned > 0 ? clamp((variance / planned) * 100, -999, 999) : actual > 0 ? 100 : 0;
    return { key, label, planned, actual, variance, variancePercent, status: variance > Math.max(planned * 0.02, 1) ? 'over' : variance < -Math.max(planned * 0.02, 1) ? 'under' : 'on_plan' };
  };
  return [
    create('labor', 'ค่าแรง', laborPlanned, laborActual),
    create('material', 'ค่าวัสดุ', materialPlanned, materialActual),
    create('other', 'ค่าใช้จ่ายอื่น', 0, otherActual),
    create('total', 'รวมทั้งหมด', materialPlanned + laborPlanned, materialActual + laborActual + otherActual),
  ];
}

export function isActiveWorkStatus(status: string) {
  return status === 'in_progress' || status === 'completed';
}

export function calculateActiveWorkCostAnalysis(input: FinancialAnalysisInput): ActiveWorkCostAnalysis {
  const activeCategories = Array.from(new Map(input.categories.filter((category) => isActiveWorkStatus(category.status)).map((category) => [category.id, category])).values());
  const activeCategoryIds = new Set(activeCategories.map((category) => category.id));
  const activeExpenses = Array.from(new Map(input.expenses.filter((expense) => Boolean(expense.category_id) && activeCategoryIds.has(expense.category_id!)).map((expense) => [expense.id, expense])).values());
  const unlinkedExpenseCount = input.expenses.filter((expense) => !expense.category_id).length;
  const inProgressCount = activeCategories.filter((category) => category.status === 'in_progress').length;
  const completedCount = activeCategories.filter((category) => category.status === 'completed').length;
  const materialPlanned = sum(activeCategories.map((category) => category.budget));
  const laborPlanned = sum(activeCategories.map((category) => category.labor_budget));
  const materialActual = expenseTotal(activeExpenses, 'material');
  const laborActual = expenseTotal(activeExpenses, 'labor');
  const create = (key: ActiveWorkCostVariance['key'], label: string, planned: number, actual: number): ActiveWorkCostVariance => {
    const variance = actual - planned;
    const variancePercent = planned > 0 ? clamp((variance / planned) * 100, -999, 999) : actual > 0 ? 100 : 0;
    const status = planned === 0
      ? actual > 0 ? 'over' as const : 'on_plan' as const
      : variancePercent > 3 ? 'over' as const : variancePercent < -3 ? 'under' as const : 'on_plan' as const;
    return { key, label, planned, actual, variance, variancePercent, status, utilizationPercent: planned > 0 ? clamp((actual / planned) * 100, 0, 999) : null };
  };
  return {
    activeWorkCount: activeCategories.length,
    inProgressCount,
    completedCount,
    unlinkedExpenseCount,
    variances: [
      create('labor', 'ค่าแรง', laborPlanned, laborActual),
      create('material', 'ค่าวัสดุ', materialPlanned, materialActual),
      create('total', 'รวมทั้งหมด', laborPlanned + materialPlanned, laborActual + materialActual),
    ],
  };
}

export function calculateAdjustedProjectBudget(input: FinancialAnalysisInput): AdjustedProjectBudgetAnalysis {
  const categories = Array.from(new Map(input.categories.map((category) => [category.id, category])).values());
  const expenses = Array.from(new Map(input.expenses.map((expense) => [expense.id, expense])).values());
  const categoryBudget = sum(categories.map((category) => safeNumber(category.budget) + safeNumber(category.labor_budget)));
  const originalBudget = categoryBudget || safeNumber(input.project?.total_budget);
  const completedCategories = categories.filter((category) => category.status === 'completed');

  let completedWorkPlannedCost = 0;
  let completedWorkActualCost = 0;
  let completedWithoutActualCount = 0;

  completedCategories.forEach((category) => {
    const linkedExpenses = expenses.filter((expense) => expense.category_id === category.id);
    if (linkedExpenses.length === 0) {
      completedWithoutActualCount += 1;
      return;
    }

    completedWorkPlannedCost += safeNumber(category.budget) + safeNumber(category.labor_budget);
    completedWorkActualCost += expenseTotal(linkedExpenses);
  });

  const budgetAdjustment = completedWorkActualCost - completedWorkPlannedCost;
  return {
    originalBudget,
    completedWorkPlannedCost,
    completedWorkActualCost,
    budgetAdjustment,
    adjustedBudget: Math.max(0, originalBudget + budgetAdjustment),
    completedWorkCount: completedCategories.length,
    completedWithoutActualCount,
  };
}

export function calculateBurnRate(expenses: ConstructionExpenseRow[], today = new Date()): BurnRateAnalysis {
  if (expenses.length < 2) return { available: false, daily: 0, weekly: 0, monthly: 0, recentDaily: 0, previousDaily: 0, trendPercent: null };
  const dated = expenses.map((expense) => ({ amount: safeNumber(expense.amount), date: new Date(`${expense.expense_date}T00:00:00`) })).filter((item) => !Number.isNaN(item.date.getTime()));
  if (dated.length < 2) return { available: false, daily: 0, weekly: 0, monthly: 0, recentDaily: 0, previousDaily: 0, trendPercent: null };
  const first = Math.min(...dated.map((item) => item.date.getTime()));
  const last = Math.max(...dated.map((item) => item.date.getTime()));
  const spanDays = Math.max(1, Math.ceil((last - first) / 86_400_000) + 1);
  const daily = expenseTotal(expenses) / spanDays;
  const age = (date: Date) => Math.floor((today.getTime() - date.getTime()) / 86_400_000);
  const recent = sum(dated.filter((item) => age(item.date) >= 0 && age(item.date) < 30).map((item) => item.amount)) / 30;
  const previous = sum(dated.filter((item) => age(item.date) >= 30 && age(item.date) < 60).map((item) => item.amount)) / 30;
  return { available: spanDays >= 7, daily, weekly: daily * 7, monthly: daily * 30, recentDaily: recent, previousDaily: previous, trendPercent: previous > 0 ? clamp(((recent - previous) / previous) * 100, -999, 999) : null };
}

const healthLevel = (score: number): FinancialHealthLevel => score >= 80 ? 'strong' : score >= 60 ? 'watch' : score >= 40 ? 'risk' : 'high_risk';
const riskFromForecast = (forecast: number, budget: number): FinancialRiskLevel => budget <= 0 || forecast > budget * 1.1 ? 'high' : forecast > budget ? 'medium' : 'low';

export function calculateBudgetForecast(input: FinancialAnalysisInput) {
  const categoryBudget = sum(input.categories.map((category) => safeNumber(category.budget) + safeNumber(category.labor_budget)));
  // The existing Project Budget Monitor treats category material + labor budgets as the live project budget.
  const budget = categoryBudget || safeNumber(input.project?.total_budget);
  const actual = expenseTotal(input.expenses);
  const progressPercent = getProgress(input.categories);
  // There is no future planned-expense entity in the current schema. Forecast uses actual spend per measured progress and never adds category budgets on top of actual.
  const progressForecast = progressPercent && progressPercent > 0 ? actual / (progressPercent / 100) : Math.max(actual, categoryBudget);
  const forecast = Math.max(actual, progressForecast);
  const overrun = Math.max(0, forecast - budget);
  const remaining = budget - forecast;
  const probability = budget > 0 ? clamp(35 + ((forecast / budget) - 0.85) * 130, 5, 95) : 95;
  const missingData: string[] = [];
  if (!input.expenses.length) missingData.push('ยังไม่มีรายการค่าใช้จ่ายจริง');
  if (progressPercent === null || progressPercent === 0) missingData.push('ยังไม่มีความคืบหน้าที่เพียงพอ');
  missingData.push('ไม่มีรายการแผนค่าใช้จ่ายในอนาคต');
  missingData.push('ไม่มีวันที่เริ่มต้นหรือวันที่สิ้นสุดโครงการ');
  return { budget, actual, progressPercent, forecast, overrun, remaining, probability, risk: riskFromForecast(forecast, budget), confidence: input.expenses.length >= 3 && progressPercent && progressPercent > 0 ? 'medium' as const : 'low' as const, missingData };
}

export function calculateFinancialHealthScore(input: FinancialAnalysisInput, forecastData = calculateBudgetForecast(input)) {
  const variances = calculatePlanActualVariance(input);
  const material = variances.find((item) => item.key === 'material')!;
  const labor = variances.find((item) => item.key === 'labor')!;
  const budgetUsage = forecastData.budget > 0 ? forecastData.actual / forecastData.budget : 1;
  let score = 100;
  const reasons: string[] = [];
  if (forecastData.forecast > forecastData.budget) { score -= 30; reasons.push(`แนวโน้มค่าใช้จ่ายอาจเกินงบ ${money(forecastData.overrun)}`); }
  else reasons.push(`Forecast ยังอยู่ต่ำกว่างบประมาณ ${money(Math.max(0, forecastData.remaining))}`);
  if (budgetUsage > 0.9) { score -= 20; reasons.push('เงินคงเหลือน้อยกว่า 10% ของงบโครงการ'); }
  else reasons.push(`ใช้เงินจริงแล้ว ${Math.round(budgetUsage * 100)}% ของงบทั้งหมด`);
  if (labor.status === 'over') { score -= Math.min(15, Math.abs(labor.variancePercent)); reasons.push(`ค่าแรงเกินแผน ${Math.abs(labor.variancePercent).toFixed(1)}%`); }
  else reasons.push('ค่าแรงยังไม่เกินกรอบที่วางไว้');
  if (material.status === 'over') { score -= Math.min(15, Math.abs(material.variancePercent)); reasons.push(`ค่าวัสดุเกินแผน ${Math.abs(material.variancePercent).toFixed(1)}%`); }
  else reasons.push('ค่าวัสดุยังไม่เกินกรอบที่วางไว้');
  if (forecastData.progressPercent && budgetUsage * 100 > forecastData.progressPercent + 15) { score -= 15; reasons.push('สัดส่วนการใช้เงินเร็วกว่าความคืบหน้าของงาน'); }
  if (forecastData.confidence === 'low') score -= 10;
  const normalized = Math.round(clamp(score, 0, 100));
  return { score: normalized, level: healthLevel(normalized), reasons: reasons.slice(0, 5) };
}

export function analyzeProjectFinancials(input: FinancialAnalysisInput): FinancialAnalysis {
  const forecastData = calculateBudgetForecast(input);
  const variances = calculatePlanActualVariance(input);
  const health = calculateFinancialHealthScore(input, forecastData);
  return { budget: forecastData.budget, actual: forecastData.actual, remaining: forecastData.budget - forecastData.actual, progressPercent: forecastData.progressPercent, healthScore: health.score, healthLevel: health.level, healthReasons: health.reasons, forecast: forecastData.forecast, forecastRemaining: forecastData.remaining, forecastOverrun: forecastData.overrun, overrunProbability: forecastData.probability, forecastRisk: forecastData.risk, forecastConfidence: forecastData.confidence, missingData: forecastData.missingData, plannedFutureCost: null, variances };
}


