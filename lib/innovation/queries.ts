import { supabaseRestRequest } from '@/lib/supabase/rest';
import { InnovationLogRow, InnovationRow, InnovationWithLogCountRow } from '@/lib/innovation/types';

export async function getInnovationsWithLogCount(): Promise<InnovationWithLogCountRow[]> {
  return supabaseRestRequest<InnovationWithLogCountRow[]>(
    'innovations?select=*,innovation_logs(count)&order=updated_at.desc',
    'GET'
  );
}

export async function getInnovationById(id: string): Promise<InnovationRow | null> {
  const rows = await supabaseRestRequest<InnovationRow[]>(`innovations?id=eq.${id}&limit=1`, 'GET');
  return rows[0] ?? null;
}

export async function getInnovationLogsByInnovationId(innovationId: string): Promise<InnovationLogRow[]> {
  return supabaseRestRequest<InnovationLogRow[]>(
    `innovation_logs?innovation_id=eq.${innovationId}&order=created_at.desc`,
    'GET'
  );
}
