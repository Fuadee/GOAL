import { supabaseRestRequest } from '@/lib/supabase/rest';
import {
  SmvChecklistItemRow,
  SmvChecklistLogRow,
  SmvDimensionRow,
  SmvDimensionScoreRow,
  SmvScoreEventRow,
  SmvScoreEventType
} from '@/lib/smv/types';

export async function getSmvDimensions(): Promise<SmvDimensionRow[]> {
  return supabaseRestRequest<SmvDimensionRow[]>('smv_dimensions?select=*&order=created_at.asc', 'GET');
}

export async function getSmvDimensionScores(): Promise<SmvDimensionScoreRow[]> {
  return supabaseRestRequest<SmvDimensionScoreRow[]>('smv_dimension_scores?select=*', 'GET');
}

export async function getSmvDimensionScoreByDimensionId(dimensionId: string): Promise<SmvDimensionScoreRow | null> {
  const rows = await supabaseRestRequest<SmvDimensionScoreRow[]>(
    `smv_dimension_scores?dimension_id=eq.${dimensionId}&limit=1`,
    'GET'
  );

  return rows[0] ?? null;
}

export async function upsertSmvDimensionScore(input: {
  dimension_id: string;
  current_score: number;
  previous_score: number;
  updated_at?: string;
}): Promise<SmvDimensionScoreRow> {
  const rows = await supabaseRestRequest<SmvDimensionScoreRow[]>(
    'smv_dimension_scores?on_conflict=dimension_id',
    'POST',
    {
      ...input,
      updated_at: input.updated_at ?? new Date().toISOString()
    }
  );

  return rows[0];
}

export async function getSmvChecklistItemsByDimensionId(dimensionId: string): Promise<SmvChecklistItemRow[]> {
  return supabaseRestRequest<SmvChecklistItemRow[]>(
    `smv_checklist_items?dimension_id=eq.${dimensionId}&is_active=eq.true&order=sort_order.asc&order=created_at.asc`,
    'GET'
  );
}

export async function getSmvChecklistItems(): Promise<SmvChecklistItemRow[]> {
  return supabaseRestRequest<SmvChecklistItemRow[]>(
    'smv_checklist_items?select=*&is_active=eq.true&order=sort_order.asc&order=created_at.asc',
    'GET'
  );
}

export async function getSmvChecklistItemById(id: string): Promise<SmvChecklistItemRow | null> {
  const rows = await supabaseRestRequest<SmvChecklistItemRow[]>(`smv_checklist_items?id=eq.${id}&limit=1`, 'GET');
  return rows[0] ?? null;
}

export async function createSmvChecklistLog(input: {
  dimension_id: string;
  checklist_item_id: string;
  notes?: string;
}): Promise<SmvChecklistLogRow> {
  const rows = await supabaseRestRequest<SmvChecklistLogRow[]>('smv_checklist_logs', 'POST', {
    dimension_id: input.dimension_id,
    checklist_item_id: input.checklist_item_id,
    notes: input.notes?.trim() ? input.notes.trim() : null,
    completed_at: new Date().toISOString()
  });

  return rows[0];
}

export async function getSmvChecklistLogsByDimensionId(dimensionId: string, limit = 8): Promise<SmvChecklistLogRow[]> {
  return supabaseRestRequest<SmvChecklistLogRow[]>(
    `smv_checklist_logs?dimension_id=eq.${dimensionId}&order=completed_at.desc&limit=${limit}`,
    'GET'
  );
}

export async function countSmvChecklistLogsByDimensionInRange(
  dimensionId: string,
  fromIso: string,
  toIso: string
): Promise<number> {
  const rows = await supabaseRestRequest<{ id: string }[]>(
    `smv_checklist_logs?select=id&dimension_id=eq.${dimensionId}&completed_at=gte.${fromIso}&completed_at=lte.${toIso}`,
    'GET'
  );

  return rows.length;
}

export async function countSmvChecklistLogsInRange(fromIso: string, toIso: string): Promise<number> {
  const rows = await supabaseRestRequest<{ id: string }[]>(
    `smv_checklist_logs?select=id&completed_at=gte.${fromIso}&completed_at=lte.${toIso}`,
    'GET'
  );

  return rows.length;
}

export async function getLatestSmvChecklistLogByItemId(checklistItemId: string): Promise<SmvChecklistLogRow | null> {
  const rows = await supabaseRestRequest<SmvChecklistLogRow[]>(
    `smv_checklist_logs?checklist_item_id=eq.${checklistItemId}&order=completed_at.desc&limit=1`,
    'GET'
  );

  return rows[0] ?? null;
}

export async function getSmvChecklistLogsByItemId(checklistItemId: string): Promise<SmvChecklistLogRow[]> {
  return supabaseRestRequest<SmvChecklistLogRow[]>(
    `smv_checklist_logs?checklist_item_id=eq.${checklistItemId}&order=completed_at.desc`,
    'GET'
  );
}

export async function createSmvScoreEvent(input: {
  dimension_id: string;
  event_type: SmvScoreEventType;
  score_before: number;
  score_delta: number;
  score_after: number;
  reason?: string;
  checklist_log_id?: string;
}): Promise<SmvScoreEventRow> {
  const rows = await supabaseRestRequest<SmvScoreEventRow[]>('smv_score_events', 'POST', {
    dimension_id: input.dimension_id,
    event_type: input.event_type,
    score_before: input.score_before,
    score_delta: input.score_delta,
    score_after: input.score_after,
    reason: input.reason?.trim() ? input.reason.trim() : null,
    checklist_log_id: input.checklist_log_id ?? null
  });

  return rows[0];
}

export async function getSmvScoreEventsByDimensionId(
  dimensionId: string,
  limit = 20,
  eventType?: SmvScoreEventType
): Promise<SmvScoreEventRow[]> {
  const filter = eventType ? `&event_type=eq.${eventType}` : '';
  return supabaseRestRequest<SmvScoreEventRow[]>(
    `smv_score_events?dimension_id=eq.${dimensionId}${filter}&order=created_at.desc&limit=${limit}`,
    'GET'
  );
}
