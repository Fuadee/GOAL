import type { SmvProjectWithSummary } from './types';

export function getSmvProjectProgress(projects: SmvProjectWithSummary[]) {
  const milestones = projects.flatMap((project) => project.smv_project_milestones ?? []);
  const completed = milestones.filter((milestone) => milestone.is_completed).length;
  return { completed, total: milestones.length, percentage: milestones.length > 0 ? Math.round(completed / milestones.length * 100) : 0 };
}
