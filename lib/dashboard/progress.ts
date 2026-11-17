export const DASHBOARD_MODULE_IDS = ['smv', 'money', 'health', 'innovation', 'world'] as const;
export type ModuleId = typeof DASHBOARD_MODULE_IDS[number];
export type NextAction = { title: string; detail?: string; href: string; dueDate?: string };
export type ModuleProgress = {
  id: ModuleId;
  title: string;
  href: string;
  percentage: number | null;
  precision: number;
  metric: string;
  detail: string;
  completed?: number;
  total?: number;
  unit?: string;
  unavailable?: boolean;
  nextAction?: NextAction;
};

export function getOverallProgress(modules: ModuleProgress[]) {
  const measured = modules.filter((module) => DASHBOARD_MODULE_IDS.includes(module.id) && module.percentage !== null && Number.isFinite(module.percentage) && !module.unavailable);
  return {
    measuredCount: measured.length,
    // Do not silently cap financial spending: the source page can exceed 100%.
    percentage: measured.length ? measured.reduce((sum, module) => sum + module.percentage!, 0) / measured.length : null
  };
}

export function getFocusActions(modules: ModuleProgress[]) {
  return modules.filter((module) => DASHBOARD_MODULE_IDS.includes(module.id) && module.nextAction && !module.unavailable)
    .sort((a, b) => {
      // Dated plans first, then the least advanced actionable modules. Stable ties use module order.
      const dateOrder = (a.nextAction?.dueDate ?? '9999').localeCompare(b.nextAction?.dueDate ?? '9999');
      return dateOrder || (a.percentage ?? Infinity) - (b.percentage ?? Infinity);
    }).slice(0, 3);
}
