import { supabaseRestRequest } from '@/lib/supabase/rest';
import type { SmvMilestoneChecklistRow } from '@/lib/smv/types';

function isMissingChecklistsTable(error: unknown) {
  return error instanceof Error && (error.message.includes('PGRST205') || error.message.includes('42P01'));
}

export async function getMilestoneChecklists(milestoneId: string) {
  try {
    return await supabaseRestRequest<SmvMilestoneChecklistRow[]>(
      `smv_milestone_checklists?select=id,milestone_id,title,description,is_completed,created_at,updated_at&milestone_id=eq.${encodeURIComponent(milestoneId)}&order=created_at.asc`,
      'GET',
      undefined,
      { revalidate: false }
    );
  } catch (error) {
    if (isMissingChecklistsTable(error)) return [];
    throw error;
  }
}

export async function createMilestoneChecklist(input: { milestoneId: string; title: string; description?: string }) {
  const rows = await supabaseRestRequest<SmvMilestoneChecklistRow[]>('smv_milestone_checklists', 'POST', {
    milestone_id: input.milestoneId,
    title: input.title.trim(),
    description: input.description?.trim() || null
  });
  if (!rows[0]) throw new Error('Supabase did not return the created checklist.');
  return rows[0];
}

export async function updateMilestoneChecklist(input: { id: string; milestoneId: string; title: string; description?: string }) {
  const rows = await supabaseRestRequest<SmvMilestoneChecklistRow[]>(
    `smv_milestone_checklists?id=eq.${encodeURIComponent(input.id)}&milestone_id=eq.${encodeURIComponent(input.milestoneId)}`,
    'PATCH',
    { title: input.title.trim(), description: input.description?.trim() || null }
  );
  if (!rows[0]) throw new Error('Checklist not found.');
  return rows[0];
}

export async function setMilestoneChecklistCompleted(input: { id: string; milestoneId: string; isCompleted: boolean }) {
  const rows = await supabaseRestRequest<SmvMilestoneChecklistRow[]>(
    `smv_milestone_checklists?id=eq.${encodeURIComponent(input.id)}&milestone_id=eq.${encodeURIComponent(input.milestoneId)}`,
    'PATCH',
    { is_completed: input.isCompleted }
  );
  if (!rows[0]) throw new Error('Checklist not found.');
  return rows[0];
}

export async function deleteMilestoneChecklist(input: { id: string; milestoneId: string }) {
  await supabaseRestRequest<SmvMilestoneChecklistRow[]>(
    `smv_milestone_checklists?id=eq.${encodeURIComponent(input.id)}&milestone_id=eq.${encodeURIComponent(input.milestoneId)}`,
    'DELETE'
  );
}
