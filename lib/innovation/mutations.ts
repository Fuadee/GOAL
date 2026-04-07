import { supabaseRestRequest } from '@/lib/supabase/rest';
import {
  CreateInnovationLogPayload,
  CreateInnovationPayload,
  CreateInnovationProcessStepPayload,
  InnovationLogRow,
  InnovationProcessStepRow,
  InnovationRow,
  UpdateInnovationProcessStepPayload
} from '@/lib/innovation/types';

export async function createInnovation(payload: CreateInnovationPayload): Promise<InnovationRow> {
  const rows = await supabaseRestRequest<InnovationRow[]>('innovations', 'POST', payload);
  return rows[0];
}

export async function createInnovationProcessStep(payload: CreateInnovationProcessStepPayload): Promise<InnovationProcessStepRow> {
  const rows = await supabaseRestRequest<InnovationProcessStepRow[]>('innovation_process_steps', 'POST', payload);
  return rows[0];
}

export async function updateInnovationProcessStep(id: string, payload: UpdateInnovationProcessStepPayload): Promise<InnovationProcessStepRow> {
  const rows = await supabaseRestRequest<InnovationProcessStepRow[]>(`innovation_process_steps?id=eq.${id}`, 'PATCH', payload);
  return rows[0];
}

export async function createInnovationLog(payload: CreateInnovationLogPayload): Promise<InnovationLogRow> {
  const rows = await supabaseRestRequest<InnovationLogRow[]>('innovation_logs', 'POST', payload);
  return rows[0];
}

export async function touchInnovationUpdatedAt(id: string): Promise<InnovationRow> {
  const rows = await supabaseRestRequest<InnovationRow[]>(`innovations?id=eq.${id}`, 'PATCH', { updated_at: new Date().toISOString() });
  return rows[0];
}
