import { supabaseRestRequest } from '@/lib/supabase/rest';
import {
  SmvDimensionRow,
  SmvDimensionScoreRow,
  SmvEvidenceLogRow,
  SmvEvidenceMetricValueRow,
  SmvImprovementTaskRow,
  SmvLevelDefinitionRow,
  SmvMetricInputValue,
  SmvMetricRow,
  SmvScoreHistoryRow,
  SmvStageDefinitionRow,
  SmvStageProgressRow,
  SmvStageStatus,
  SmvActionLogRow,
  SmvAppearanceProgressRow
} from '@/lib/smv/types';

export async function getSmvDimensions() {
  return supabaseRestRequest<SmvDimensionRow[]>('smv_dimensions?select=*&order=created_at.asc', 'GET');
}

export async function getSmvMetrics(dimensionId?: string) {
  const filter = dimensionId ? `&dimension_id=eq.${dimensionId}` : '';
  return supabaseRestRequest<SmvMetricRow[]>(`smv_metrics?select=*&is_active=eq.true${filter}&order=created_at.asc`, 'GET');
}

export async function getSmvLevelDefinitions(dimensionId: string) {
  return supabaseRestRequest<SmvLevelDefinitionRow[]>(
    `smv_level_definitions?dimension_id=eq.${dimensionId}&order=level_score.asc`,
    'GET'
  );
}

export async function getSmvDimensionScores() {
  return supabaseRestRequest<SmvDimensionScoreRow[]>('smv_dimension_scores?select=*', 'GET');
}

export async function getSmvDimensionScore(dimensionId: string) {
  const rows = await supabaseRestRequest<SmvDimensionScoreRow[]>(`smv_dimension_scores?dimension_id=eq.${dimensionId}&limit=1`, 'GET');
  return rows[0] ?? null;
}

export async function upsertSmvDimensionScore(input: {
  dimension_id: string;
  score: number;
  evidence_count_30d: number;
  guard_summary: string;
  explanation: string;
  calculated_at?: string;
}) {
  const rows = await supabaseRestRequest<SmvDimensionScoreRow[]>('smv_dimension_scores?on_conflict=dimension_id', 'POST', {
    ...input,
    calculated_at: input.calculated_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  return rows[0];
}

export async function createSmvScoreHistory(input: {
  dimension_id: string;
  score: number;
  evidence_count_30d: number;
  guard_summary: string;
  explanation: string;
  score_breakdown: Record<string, number>;
}) {
  const rows = await supabaseRestRequest<SmvScoreHistoryRow[]>('smv_score_history', 'POST', input);
  return rows[0];
}

export async function getSmvScoreHistory(dimensionId: string, limit = 20) {
  return supabaseRestRequest<SmvScoreHistoryRow[]>(
    `smv_score_history?dimension_id=eq.${dimensionId}&order=calculated_at.desc&limit=${limit}`,
    'GET'
  );
}

export async function getSmvEvidenceLogs(dimensionId?: string, limit = 20) {
  const filter = dimensionId ? `&dimension_id=eq.${dimensionId}` : '';
  return supabaseRestRequest<SmvEvidenceLogRow[]>(
    `smv_evidence_logs?select=*&order=logged_at.desc${filter}&limit=${limit}`,
    'GET'
  );
}

export async function getSmvEvidenceLogsSince(dimensionId: string, fromIso: string) {
  return supabaseRestRequest<SmvEvidenceLogRow[]>(
    `smv_evidence_logs?dimension_id=eq.${dimensionId}&logged_at=gte.${fromIso}&order=logged_at.desc`,
    'GET'
  );
}

export async function createSmvEvidenceLog(input: {
  dimension_id: string;
  context?: string;
  note?: string;
  appearance_category?: string;
  target_level?: number;
  evidence_type?: string;
}) {
  const rows = await supabaseRestRequest<SmvEvidenceLogRow[]>('smv_evidence_logs', 'POST', {
    dimension_id: input.dimension_id,
    context: input.context?.trim() ? input.context.trim() : null,
    note: input.note?.trim() ? input.note.trim() : null,
    appearance_category: input.appearance_category ?? null,
    target_level: input.target_level ?? null,
    evidence_type: input.evidence_type ?? null,
    logged_at: new Date().toISOString()
  });

  return rows[0];
}

export async function createSmvEvidenceMetricValues(evidenceLogId: string, values: SmvMetricInputValue[]) {
  if (values.length === 0) return [];

  return supabaseRestRequest<SmvEvidenceMetricValueRow[]>('smv_evidence_metric_values', 'POST',
    values.map((item) => ({
      evidence_log_id: evidenceLogId,
      metric_id: item.metricId,
      numeric_value: item.numericValue ?? null,
      boolean_value: item.booleanValue ?? null,
      text_value: item.textValue ?? null
    }))
  );
}

export async function getSmvEvidenceMetricValuesByEvidenceIds(evidenceIds: string[]) {
  if (evidenceIds.length === 0) return [];
  const inClause = evidenceIds.join(',');
  return supabaseRestRequest<SmvEvidenceMetricValueRow[]>(
    `smv_evidence_metric_values?evidence_log_id=in.(${inClause})&order=created_at.desc`,
    'GET'
  );
}

export async function getLatestMetricValuesForDimension(metricIds: string[]) {
  if (metricIds.length === 0) return [];
  const inClause = metricIds.join(',');
  return supabaseRestRequest<SmvEvidenceMetricValueRow[]>(
    `smv_evidence_metric_values?metric_id=in.(${inClause})&order=created_at.desc&limit=${metricIds.length * 6}`,
    'GET'
  );
}

export async function getSmvImprovementTasks() {
  return supabaseRestRequest<SmvImprovementTaskRow[]>('smv_improvement_tasks?select=*&status=neq.archived&order=priority.asc', 'GET');
}

export async function upsertImprovementTask(input: {
  dimension_id: string;
  title: string;
  description?: string;
  priority: number;
  requirement?: Record<string, unknown>;
}) {
  const rows = await supabaseRestRequest<SmvImprovementTaskRow[]>('smv_improvement_tasks', 'POST', {
    dimension_id: input.dimension_id,
    title: input.title,
    description: input.description ?? null,
    priority: input.priority,
    requirement: input.requirement ?? {},
    status: 'todo',
    task_source: 'system'
  });

  return rows[0];
}

export async function getSmvStageDefinitions(dimensionKey: string) {
  return supabaseRestRequest<SmvStageDefinitionRow[]>(
    `smv_stage_definitions?dimension_key=eq.${dimensionKey}&is_active=eq.true&order=sort_order.asc`,
    'GET'
  );
}

export async function getSmvStageProgress(dimensionKey: string) {
  return supabaseRestRequest<SmvStageProgressRow[]>(
    `smv_stage_progress?dimension_key=eq.${dimensionKey}&order=created_at.asc`,
    'GET'
  );
}

export async function upsertSmvStageProgress(input: {
  dimension_key: string;
  stage_key: string;
  status: SmvStageStatus;
  note?: string;
  passed_at?: string | null;
}) {
  const rows = await supabaseRestRequest<SmvStageProgressRow[]>(
    'smv_stage_progress?on_conflict=dimension_key,stage_key',
    'POST',
    {
      ...input,
      note: input.note ?? null,
      passed_at: input.status === 'PASSED' ? input.passed_at ?? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }
  );

  return rows[0];
}


export async function getSmvActionLogs(dimension: string) {
  return supabaseRestRequest<SmvActionLogRow[]>(
    `smv_logs?dimension=eq.${dimension}&select=id,dimension,action_type,created_at&order=created_at.desc`,
    'GET'
  );
}

export async function createSmvActionLog(input: {
  dimension: string;
  action_type: string;
  value_numeric?: number;
  note?: string;
  created_at?: string;
}) {
  return supabaseRestRequest<Record<string, unknown>[]>('smv_logs', 'POST', {
    dimension: input.dimension,
    action_type: input.action_type,
    value_numeric: input.value_numeric ?? null,
    note: input.note?.trim() ? input.note.trim() : null,
    created_at: input.created_at ?? new Date().toISOString()
  });
}


export async function getSmvAppearanceProgress(dimensionId: string) {
  return supabaseRestRequest<SmvAppearanceProgressRow[]>(
    `smv_appearance_progress?dimension_id=eq.${dimensionId}&order=category_key.asc`,
    'GET'
  );
}

export async function upsertSmvAppearanceProgress(input: {
  dimension_id: string;
  category_key: string;
  unlocked_level: number;
  note?: string;
  evidence_count?: number;
}) {
  const rows = await supabaseRestRequest<SmvAppearanceProgressRow[]>(
    'smv_appearance_progress?on_conflict=dimension_id,category_key',
    'POST',
    {
      ...input,
      note: input.note ?? null,
      evidence_count: input.evidence_count,
      updated_at: new Date().toISOString()
    }
  );

  return rows[0];
}
