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
  SmvAppearanceProgressRow,
  SmvMissionRewardRow,
  SmvMissionRewardStatus,
  SmvRealDateHistoryRow,
  SocialEvidenceRow,
  SocialEvidenceType,
  SocialLevelRow,
  SocialProgressRow,
  SocialRequirementRow
} from '@/lib/smv/types';

export const SMV_REWARD_KEY = 'smv_reward';

const defaultSmvReward: Omit<SmvMissionRewardRow, 'id' | 'created_at' | 'updated_at'> = {
  reward_key: SMV_REWARD_KEY,
  title: 'เที่ยวคนเดียว',
  description: 'ให้รางวัลกับตัวเองเมื่อกล้าเปิดชีวิตจริง',
  emotional_copy: 'ปลดล็อกเมื่อออกเดทจริงสำเร็จ 1 ครั้ง',
  image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  status: 'unclaimed',
  target_count: 1,
  round_number: 1,
  claimed_at: null
};

export function getDefaultSmvReward(): SmvMissionRewardRow {
  const now = new Date().toISOString();
  return {
    id: SMV_REWARD_KEY,
    ...defaultSmvReward,
    created_at: now,
    updated_at: now
  };
}

export async function getSmvDimensions() {
  return supabaseRestRequest<SmvDimensionRow[]>('smv_dimensions?select=id,key,label,description,color_token,created_at,updated_at&order=created_at.asc', 'GET');
}

export async function getSmvMetrics(dimensionId?: string) {
  const filter = dimensionId ? `&dimension_id=eq.${dimensionId}` : '';
  return supabaseRestRequest<SmvMetricRow[]>(`smv_metrics?select=id,dimension_id,key,label,description,value_type,weight,is_required,config,is_active,created_at,updated_at&is_active=eq.true${filter}&order=created_at.asc`, 'GET');
}

export async function getSmvLevelDefinitions(dimensionId: string) {
  return supabaseRestRequest<SmvLevelDefinitionRow[]>(
    `smv_level_definitions?dimension_id=eq.${dimensionId}&order=level_score.asc`,
    'GET'
  );
}

export async function getSmvDimensionScores() {
  return supabaseRestRequest<SmvDimensionScoreRow[]>('smv_dimension_scores?select=dimension_id,score,evidence_count_30d,guard_summary,explanation,calculated_at,created_at,updated_at', 'GET');
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
    `smv_evidence_logs?select=id,dimension_id,logged_at,context,note,source,appearance_category,target_level,evidence_type,created_at,updated_at&order=logged_at.desc${filter}&limit=${limit}`,
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
  return supabaseRestRequest<SmvImprovementTaskRow[]>('smv_improvement_tasks?select=id,dimension_id,title,description,priority,status,task_source,requirement,due_date,created_at,updated_at&status=neq.archived&order=priority.asc', 'GET');
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

export async function getSocialLevels() {
  return supabaseRestRequest<SocialLevelRow[]>('social_levels?select=id,title,description,phase,score,created_at,updated_at&order=id.asc', 'GET');
}

export async function getSocialRequirements() {
  return supabaseRestRequest<SocialRequirementRow[]>('social_requirements?select=id,level_id,requirement_text,requirement_type,required_value,created_at&order=level_id.asc,id.asc', 'GET');
}

export async function getSocialProgressByUser(userId: string) {
  return supabaseRestRequest<SocialProgressRow[]>(`social_progress?user_id=eq.${userId}&order=level_id.asc`, 'GET');
}

export async function upsertSocialProgress(input: { user_id: string; level_id: number; is_completed: boolean; completed_at?: string | null }) {
  const rows = await supabaseRestRequest<SocialProgressRow[]>('social_progress?on_conflict=user_id,level_id', 'POST', {
    ...input,
    completed_at: input.is_completed ? (input.completed_at ?? new Date().toISOString()) : null,
    updated_at: new Date().toISOString()
  });

  return rows[0];
}

export async function createSocialEvidence(input: {
  user_id: string;
  level_id: number;
  type: SocialEvidenceType;
  note?: string;
  image_url?: string;
}) {
  const rows = await supabaseRestRequest<SocialEvidenceRow[]>('social_evidence', 'POST', {
    user_id: input.user_id,
    level_id: input.level_id,
    type: input.type,
    note: input.note?.trim() ? input.note.trim() : null,
    image_url: input.image_url?.trim() ? input.image_url.trim() : null
  });
  return rows[0];
}

export async function getSocialEvidenceByUser(userId: string, limit = 100) {
  return supabaseRestRequest<SocialEvidenceRow[]>(`social_evidence?user_id=eq.${userId}&order=created_at.desc&limit=${limit}`, 'GET');
}

export async function getSmvRealDateHistory() {
  return supabaseRestRequest<SmvRealDateHistoryRow[]>('smv_real_date_history?select=id,user_id,title,date,reflection,tags,created_at,updated_at&order=date.desc&order=created_at.desc&limit=20', 'GET');
}

export async function createSmvRealDateHistory(input: {
  user_id?: string | null;
  title: string;
  date: string;
  reflection?: string;
  tags?: string[];
}) {
  const rows = await supabaseRestRequest<SmvRealDateHistoryRow[]>('smv_real_date_history', 'POST', {
    user_id: input.user_id ?? null,
    title: input.title.trim(),
    date: input.date,
    reflection: input.reflection?.trim() ? input.reflection.trim() : null,
    tags: input.tags ?? []
  });
  return rows[0];
}

export async function updateSmvRealDateHistory(
  id: string,
  input: { title: string; date: string; reflection?: string; tags?: string[] }
) {
  const rows = await supabaseRestRequest<SmvRealDateHistoryRow[]>(`smv_real_date_history?id=eq.${id}`, 'PATCH', {
    title: input.title.trim(),
    date: input.date,
    reflection: input.reflection?.trim() ? input.reflection.trim() : null,
    tags: input.tags ?? [],
    updated_at: new Date().toISOString()
  });
  return rows[0];
}

export async function deleteSmvRealDateHistory(id: string) {
  await supabaseRestRequest<SmvRealDateHistoryRow[]>(`smv_real_date_history?id=eq.${id}`, 'DELETE');
}

export async function getSmvMissionReward(rewardKey = SMV_REWARD_KEY) {
  try {
    const rows = await supabaseRestRequest<SmvMissionRewardRow[]>(
      `smv_mission_rewards?select=id,reward_key,title,description,emotional_copy,image_url,status,target_count,round_number,claimed_at,created_at,updated_at&reward_key=eq.${rewardKey}&limit=1`,
      'GET'
    );
    return rows[0] ?? null;
  } catch {
    return rewardKey === SMV_REWARD_KEY ? getDefaultSmvReward() : null;
  }
}

export async function upsertSmvMissionReward(input: {
  reward_key?: string;
  title: string;
  description?: string | null;
  emotional_copy?: string | null;
  image_url?: string | null;
  status?: SmvMissionRewardStatus | null;
  target_count?: number | null;
  round_number?: number | null;
}) {
  const rows = await supabaseRestRequest<SmvMissionRewardRow[]>(
    'smv_mission_rewards?on_conflict=reward_key',
    'POST',
    {
      reward_key: input.reward_key ?? SMV_REWARD_KEY,
      title: input.title.trim(),
      description: input.description?.trim() ? input.description.trim() : null,
      emotional_copy: input.emotional_copy?.trim() ? input.emotional_copy.trim() : null,
      image_url: input.image_url?.trim() ? input.image_url.trim() : null,
      status: input.status ?? 'unclaimed',
      target_count: input.target_count ?? 1,
      round_number: input.round_number ?? 1,
      claimed_at: input.status === 'claimed' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }
  );
  return rows[0];
}

export async function deleteSmvMissionReward(rewardKey = SMV_REWARD_KEY) {
  await supabaseRestRequest<SmvMissionRewardRow[]>(`smv_mission_rewards?reward_key=eq.${rewardKey}`, 'DELETE');
}

export async function updateSmvMissionRewardStatus(rewardKey: string, status: SmvMissionRewardStatus) {
  const rows = await supabaseRestRequest<SmvMissionRewardRow[]>(
    `smv_mission_rewards?reward_key=eq.${rewardKey}`,
    'PATCH',
    {
      status,
      claimed_at: status === 'claimed' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }
  );
  return rows[0];
}

export async function startNewSmvMissionRewardRound(rewardKey = SMV_REWARD_KEY, completedDateCount = 0) {
  const current = await getSmvMissionReward(rewardKey);
  const previousTarget = current?.target_count ?? 1;
  const nextTarget = Math.max(previousTarget + 1, completedDateCount + 1);
  const nextRound = (current?.round_number ?? 1) + 1;

  return upsertSmvMissionReward({
    reward_key: rewardKey,
    title: current?.title ?? defaultSmvReward.title,
    description: current?.description ?? defaultSmvReward.description,
    emotional_copy: current?.emotional_copy ?? defaultSmvReward.emotional_copy,
    image_url: current?.image_url ?? defaultSmvReward.image_url,
    status: 'unclaimed',
    target_count: nextTarget,
    round_number: nextRound
  });
}
