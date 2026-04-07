import { supabaseRestRequest } from '@/lib/supabase/rest';
import { CreateInnovationLogPayload, CreateInnovationPayload, InnovationLogRow, InnovationRow, UpdateInnovationPayload } from '@/lib/innovation/types';

export async function createInnovation(payload: CreateInnovationPayload): Promise<InnovationRow> {
  const rows = await supabaseRestRequest<InnovationRow[]>('innovations', 'POST', payload);
  return rows[0];
}

export async function createInnovationLog(payload: CreateInnovationLogPayload): Promise<InnovationLogRow> {
  const rows = await supabaseRestRequest<InnovationLogRow[]>('innovation_logs', 'POST', payload);
  return rows[0];
}

export async function updateInnovation(id: string, payload: UpdateInnovationPayload): Promise<InnovationRow> {
  const rows = await supabaseRestRequest<InnovationRow[]>(`innovations?id=eq.${id}`, 'PATCH', payload);
  return rows[0];
}
