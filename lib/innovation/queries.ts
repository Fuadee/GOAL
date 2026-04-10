import { supabaseRestRequest } from '@/lib/supabase/rest';
import {
  DiscoveryCandidateRow,
  InnovationDashboardRow,
  InnovationLogRow,
  InnovationProcessStepRow,
  InnovationRow
} from '@/lib/innovation/types';

export async function getInnovationDashboardRows(): Promise<InnovationDashboardRow[]> {
  return supabaseRestRequest<InnovationDashboardRow[]>(
    'innovations?select=*,innovation_process_steps(id,title,status,step_order,created_at)&order=updated_at.desc',
    'GET'
  );
}

export async function getDiscoveryCandidates(): Promise<DiscoveryCandidateRow[]> {
  return supabaseRestRequest<DiscoveryCandidateRow[]>(
    'discovery_candidates?order=created_at.desc',
    'GET'
  );
}

export async function getDiscoveryCandidateById(id: string): Promise<DiscoveryCandidateRow | null> {
  const rows = await supabaseRestRequest<DiscoveryCandidateRow[]>(`discovery_candidates?id=eq.${id}&limit=1`, 'GET');
  return rows[0] ?? null;
}

export async function getInnovationById(id: string): Promise<InnovationRow | null> {
  const rows = await supabaseRestRequest<InnovationRow[]>(`innovations?id=eq.${id}&limit=1`, 'GET');
  return rows[0] ?? null;
}

export async function getInnovationProcessStepsByInnovationId(innovationId: string): Promise<InnovationProcessStepRow[]> {
  return supabaseRestRequest<InnovationProcessStepRow[]>(
    `innovation_process_steps?innovation_id=eq.${innovationId}&order=step_order.asc.nullslast&order=created_at.asc`,
    'GET'
  );
}

export async function getInnovationLogsByInnovationId(innovationId: string): Promise<InnovationLogRow[]> {
  return supabaseRestRequest<InnovationLogRow[]>(
    `innovation_logs?innovation_id=eq.${innovationId}&order=created_at.desc`,
    'GET'
  );
}
