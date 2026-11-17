import type { ConstructionCategoryRow, ConstructionCostType, ConstructionExpenseRow, ConstructionInvestmentProjectsData, ConstructionOperationChecklistItem, ConstructionProjectBudgetData } from './types';

export function getConstructionBudgetSummary(budgetData: ConstructionProjectBudgetData) {
  const materialSummary = getCostTypeBudgetSummary(budgetData, 'material');
  const laborSummary = getCostTypeBudgetSummary(budgetData, 'labor');
  const materialBudgetTotal = materialSummary.budget;
  const laborBudgetTotal = laborSummary.budget;
  const materialActualTotal = materialSummary.actual;
  const laborActualTotal = laborSummary.actual;
  const grandBudgetTotal = materialBudgetTotal + laborBudgetTotal;
  const grandActualTotal = materialActualTotal + laborActualTotal;
  const grandRemainingTotal = grandBudgetTotal - grandActualTotal;
  const progressPercent = grandBudgetTotal > 0 ? Math.min((grandActualTotal / grandBudgetTotal) * 100, 999) : 0;
  return {
    materialBudgetTotal,
    materialActualTotal,
    laborBudgetTotal,
    laborActualTotal,
    grandBudgetTotal,
    grandActualTotal,
    grandRemainingTotal,
    progressPercent,
    totalBudget: grandBudgetTotal,
    totalSpent: grandActualTotal,
    remaining: grandRemainingTotal,
    financeProgress: progressPercent,
  };
}

export function getProjectBudgetData(data: ConstructionInvestmentProjectsData, projectId: string | null): ConstructionProjectBudgetData {
  const project = data.projects.find((item) => item.id === projectId) ?? null;
  if (!project) return { project: null, categories: [], expenses: [] };
  return {
    project,
    categories: data.categories.filter((category) => category.project_id === project.id),
    expenses: data.expenses.filter((expense) => expense.project_id === project.id),
  };
}

export function getExpenseCostType(expense: ConstructionExpenseRow): ConstructionCostType {
  return expense.cost_type === 'labor' ? 'labor' : 'material';
}

export function getCostTypeBudgetSummary(budgetData: Pick<ConstructionProjectBudgetData, 'categories' | 'expenses'>, costType: ConstructionCostType) {
  const budget = budgetData.categories.reduce((sum, category) => sum + Number(costType === 'labor' ? category.labor_budget : category.budget), 0);
  const expenses = budgetData.expenses.filter((expense) => getExpenseCostType(expense) === costType);
  const actual = expenses.reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);
  return {
    budget,
    actual,
    remaining: budget - actual,
    percent: budget > 0 ? (actual / budget) * 100 : 0,
    count: expenses.length,
    expenses,
  };
}

export function getOperationChecklist(category: ConstructionCategoryRow | null): ConstructionOperationChecklistItem[] {
  const checklist = category?.operation_checklist;
  if (!Array.isArray(checklist)) return [];
  return checklist
    .map((item) => ({ id: String(item.id || ''), title: String(item.title || '').trim(), done: Boolean(item.done) }))
    .filter((item) => item.title);
}

export function getFinancialGoalProgress(data: ConstructionInvestmentProjectsData) {
  const normalizedTargetName = 'บ้านเช่า 6 ห้อง';
  const targetProject = data.projects.find((project) => project.name.trim() === normalizedTargetName)
    ?? data.projects.find((project) => project.name.includes('บ้านเช่า') && project.name.includes('6'))
    ?? data.projects.find((project) => project.name.includes('บ้านเช่า'))
    ?? null;
  const budgetData = targetProject ? getProjectBudgetData(data, targetProject.id) : null;
  const summary = budgetData ? getConstructionBudgetSummary(budgetData) : null;
  const progress = summary?.financeProgress ?? 0;
  const checklist = budgetData?.categories.flatMap((category) => getOperationChecklist(category)) ?? [];
  const completedCount = checklist.filter((item) => item.done).length;
  return { targetProject, progress, checklist, completedCount, summary };
}
