export const SMV_DIMENSION_KEYS = ['confidence', 'look', 'status', 'social'] as const;
export const SMV_OVERVIEW_DIMENSION_KEYS = ['confidence', 'appearance', 'status', 'social_connection'] as const;

export type SmvDimensionKey = (typeof SMV_DIMENSION_KEYS)[number];
export type SmvOverviewDimensionKey = (typeof SMV_OVERVIEW_DIMENSION_KEYS)[number];
export type SmvMetricValueType = 'score_0_100' | 'count' | 'boolean' | 'currency_monthly';
export type SmvStageStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PASSED';

export type SmvActionType = string;

export type SmvConfidenceLevelDefinition = {
  level: number;
  title: string;
  description: string;
  required_count: number;
  action_type: string;
};

export type SmvActionLogRow = {
  id: string;
  dimension: SmvDimensionKey;
  action_type: string;
  created_at: string;
};

export type SmvDimensionRow = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  color_token: string | null;
  created_at: string;
  updated_at: string;
};

export type SmvMetricRow = {
  id: string;
  dimension_id: string;
  key: string;
  label: string;
  description: string | null;
  value_type: SmvMetricValueType;
  weight: number;
  is_required: boolean;
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SmvEvidenceLogRow = {
  id: string;
  dimension_id: string;
  logged_at: string;
  context: string | null;
  note: string | null;
  source: string;
  appearance_category: string | null;
  target_level: number | null;
  evidence_type: string | null;
  created_at: string;
  updated_at: string;
};

export type SmvEvidenceMetricValueRow = {
  id: string;
  evidence_log_id: string;
  metric_id: string;
  numeric_value: number | null;
  boolean_value: boolean | null;
  text_value: string | null;
  created_at: string;
  updated_at: string;
};

export type SmvLevelDefinitionRow = {
  id: string;
  dimension_id: string;
  level_score: number;
  title: string;
  requirement_text: string;
  created_at: string;
  updated_at: string;
};

export type SmvDimensionScoreRow = {
  dimension_id: string;
  score: number;
  evidence_count_30d: number;
  guard_summary: string | null;
  explanation: string | null;
  calculated_at: string;
  created_at: string;
  updated_at: string;
};

export type SmvScoreHistoryRow = {
  id: string;
  dimension_id: string;
  score: number;
  evidence_count_30d: number;
  guard_summary: string | null;
  explanation: string | null;
  score_breakdown: Record<string, number>;
  calculated_at: string;
  created_at: string;
};

export type SmvImprovementTaskRow = {
  id: string;
  dimension_id: string;
  title: string;
  description: string | null;
  priority: number;
  status: 'todo' | 'in_progress' | 'done' | 'archived';
  task_source: string;
  requirement: Record<string, unknown>;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type SmvStageDefinitionRow = {
  id: string;
  dimension_key: string;
  stage_number: number;
  stage_key: string;
  title_th: string;
  description_th: string;
  action_hint_th: string;
  score_value: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SmvStageProgressRow = {
  id: string;
  dimension_key: string;
  stage_key: string;
  status: SmvStageStatus;
  passed_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type SmvAppearanceCategoryKey = 'style' | 'body' | 'grooming';

export type SmvAppearanceProgressRow = {
  id: string;
  dimension_id: string;
  category_key: SmvAppearanceCategoryKey;
  unlocked_level: number;
  note: string | null;
  evidence_count: number;
  created_at: string;
  updated_at: string;
};

export type SocialPhase = 'Survival' | 'Presence' | 'Influence' | 'Leverage';
export type SocialRequirementType = 'metric' | 'manual' | 'evidence';
export type SocialEvidenceType = 'chat' | 'meetup' | 'connection' | 'other';

export type SocialLevelRow = {
  id: number;
  title: string;
  description: string;
  phase: SocialPhase;
  score: number;
  created_at: string;
  updated_at: string;
};

export type SocialRequirementRow = {
  id: bigint;
  level_id: number;
  requirement_text: string;
  requirement_type: SocialRequirementType;
  required_value: string | null;
  created_at: string;
};

export type SocialProgressRow = {
  user_id: string;
  level_id: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialEvidenceRow = {
  id: bigint;
  user_id: string;
  level_id: number;
  type: SocialEvidenceType;
  note: string | null;
  image_url: string | null;
  created_at: string;
};

export type SmvMetricInputValue = {
  metricId: string;
  key: string;
  valueType: SmvMetricValueType;
  numericValue?: number;
  booleanValue?: boolean;
  textValue?: string;
};

export type SmvEvidenceInput = {
  dimensionId: string;
  context?: string;
  note?: string;
  appearanceCategory?: SmvAppearanceCategoryKey;
  targetLevel?: number;
  evidenceType?: string;
  metricValues: SmvMetricInputValue[];
};

export type SmvDimensionOverview = {
  dimension: SmvDimensionRow;
  score: number;
  guardSummary: string;
  explanation: string;
};

export type SmvDimensionDetail = {
  overview: SmvDimensionOverview;
  levelDefinitions: SmvLevelDefinitionRow[];
};
