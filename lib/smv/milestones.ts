import { supabaseRestRequest } from '@/lib/supabase/rest';
import type { SmvProjectMilestoneRow } from '@/lib/smv/types';

function isMissingMilestonesTable(error: unknown) {
  return error instanceof Error && (error.message.includes('PGRST205') || error.message.includes('42P01'));
}

export async function getProjectMilestones(projectId: string) {
  try {
    return await supabaseRestRequest<SmvProjectMilestoneRow[]>(
      `smv_project_milestones?select=id,project_id,title,description,is_completed,created_at,updated_at&project_id=eq.${encodeURIComponent(projectId)}&order=created_at.asc`,
      'GET',
      undefined,
      { revalidate: false }
    );
  } catch (error) {
    if (isMissingMilestonesTable(error)) return [];
    throw error;
  }
}

export async function getProjectMilestoneById(projectId: string, milestoneId: string) {
  try {
    const rows = await supabaseRestRequest<SmvProjectMilestoneRow[]>(
      `smv_project_milestones?select=id,project_id,title,description,is_completed,created_at,updated_at&id=eq.${encodeURIComponent(milestoneId)}&project_id=eq.${encodeURIComponent(projectId)}&limit=1`,
      'GET',
      undefined,
      { revalidate: false }
    );
    return rows[0] ?? null;
  } catch (error) {
    if (isMissingMilestonesTable(error)) return null;
    throw error;
  }
}

export async function createProjectMilestone(input: { projectId: string; title: string; description?: string }) {
  const rows = await supabaseRestRequest<SmvProjectMilestoneRow[]>('smv_project_milestones', 'POST', {
    project_id: input.projectId,
    title: input.title.trim(),
    description: input.description?.trim() || null
  });
  if (!rows[0]) throw new Error('Supabase did not return the created milestone.');
  return rows[0];
}

export async function updateProjectMilestone(input: { id: string; projectId: string; title: string; description?: string }) {
  const rows = await supabaseRestRequest<SmvProjectMilestoneRow[]>(
    `smv_project_milestones?id=eq.${encodeURIComponent(input.id)}&project_id=eq.${encodeURIComponent(input.projectId)}`,
    'PATCH',
    { title: input.title.trim(), description: input.description?.trim() || null }
  );
  if (!rows[0]) throw new Error('Milestone not found.');
  return rows[0];
}

export async function deleteProjectMilestone(input: { id: string; projectId: string }) {
  await supabaseRestRequest<SmvProjectMilestoneRow[]>(
    `smv_project_milestones?id=eq.${encodeURIComponent(input.id)}&project_id=eq.${encodeURIComponent(input.projectId)}`,
    'DELETE'
  );
}
