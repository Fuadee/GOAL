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
    'innovations?select=id,title,description,goal,status,result,ended_at,is_active,is_blocked,blocked_reason,blocked_at,created_at,updated_at,reward_title,reward_thai_title,reward_description,reward_emotional_copy,reward_image_url,reward_status,innovation_process_steps(id,title,status,step_order,created_at,updated_at,note)&order=updated_at.desc&limit=50',
    'GET'
  );
}

export async function getDiscoveryCandidates(): Promise<DiscoveryCandidateRow[]> {
  return supabaseRestRequest<DiscoveryCandidateRow[]>(
    'discovery_candidates?select=id,title,problem,concept,validation_notes,validated_at,converted_at,converted_innovation_id,source,impact_score,feasibility_score,status,notes,created_at&order=created_at.desc&limit=25',
    'GET'
  );
}

export async function getDiscoveryCandidateById(id: string): Promise<DiscoveryCandidateRow | null> {
  const rows = await supabaseRestRequest<DiscoveryCandidateRow[]>(`discovery_candidates?select=id,title,problem,concept,validation_notes,validated_at,converted_at,converted_innovation_id,source,impact_score,feasibility_score,status,notes,created_at&id=eq.${id}&limit=1`, 'GET');
  return rows[0] ?? null;
}

export async function getInnovationById(id: string): Promise<InnovationRow | null> {
  const rows = await supabaseRestRequest<InnovationRow[]>(`innovations?select=id,title,description,goal,status,result,ended_at,is_active,is_blocked,blocked_reason,blocked_at,created_at,updated_at,reward_title,reward_thai_title,reward_description,reward_emotional_copy,reward_image_url,reward_status&id=eq.${id}&limit=1`, 'GET');
  return rows[0] ?? null;
}

export async function getInnovationProcessStepsByInnovationId(innovationId: string): Promise<InnovationProcessStepRow[]> {
  return supabaseRestRequest<InnovationProcessStepRow[]>(
    `innovation_process_steps?select=id,innovation_id,title,description,step_order,status,note,completed_at,created_at,updated_at&innovation_id=eq.${innovationId}&order=step_order.asc.nullslast&order=created_at.asc`,
    'GET'
  );
}

export async function getInnovationLogsByInnovationId(innovationId: string): Promise<InnovationLogRow[]> {
  return supabaseRestRequest<InnovationLogRow[]>(
    `innovation_logs?select=id,innovation_id,log_type,title,detail,problem,solution,result,lesson_learned,next_step,created_at&innovation_id=eq.${innovationId}&order=created_at.desc&limit=50`,
    'GET'
  );
}
