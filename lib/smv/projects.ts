import { supabaseRestRequest } from '@/lib/supabase/rest';
import type { SmvProjectRow, SmvProjectWithSummary } from '@/lib/smv/types';

function isMissingSmvProjectsTable(error: unknown) {
  return error instanceof Error && (error.message.includes('PGRST205') || error.message.includes('42P01'));
}

export async function getSmvProjects() {
  try {
    return await supabaseRestRequest<SmvProjectWithSummary[]>(
      'smv_projects?select=id,title,description,created_at,updated_at,smv_project_milestones(id,is_completed)&order=created_at.desc',
      'GET',
      undefined,
      { revalidate: false }
    );
  } catch (error) {
    if (isMissingSmvProjectsTable(error)) return [];
    throw error;
  }
}

export async function getSmvProjectById(id: string) {
  try {
    const rows = await supabaseRestRequest<SmvProjectRow[]>(
      `smv_projects?select=id,title,description,created_at,updated_at&id=eq.${encodeURIComponent(id)}&limit=1`,
      'GET',
      undefined,
      { revalidate: false }
    );
    return rows[0] ?? null;
  } catch (error) {
    if (isMissingSmvProjectsTable(error)) return null;
    throw error;
  }
}

export async function createSmvProject(input: { title: string; description?: string }) {
  const rows = await supabaseRestRequest<SmvProjectRow[]>('smv_projects', 'POST', {
    title: input.title.trim(),
    description: input.description?.trim() || null
  });
  if (!rows[0]) throw new Error('Supabase did not return the created project.');
  return rows[0];
}

export async function updateSmvProject(input: { id: string; title: string; description?: string }) {
  const rows = await supabaseRestRequest<SmvProjectRow[]>(
    `smv_projects?id=eq.${encodeURIComponent(input.id)}`,
    'PATCH',
    { title: input.title.trim(), description: input.description?.trim() || null }
  );
  if (!rows[0]) throw new Error('Project not found.');
  return rows[0];
}

export async function deleteSmvProject(id: string) {
  await supabaseRestRequest<SmvProjectRow[]>(`smv_projects?id=eq.${encodeURIComponent(id)}`, 'DELETE');
}
