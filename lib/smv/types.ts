export const SMV_DIMENSION_KEYS = ['confidence', 'fun', 'preselection', 'status', 'social', 'purpose', 'protection', 'look'] as const;

export type SmvDimensionKey = (typeof SMV_DIMENSION_KEYS)[number];
export type SmvMetricValueType = 'score_0_100' | 'count' | 'boolean' | 'currency_monthly';

export type SmvDimensionRow = {
  id: string;
  key: SmvDimensionKey;
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
  metrics: Array<SmvMetricRow & { latestValue: number | boolean | string | null }>;
  levelDefinitions: SmvLevelDefinitionRow[];
  history: SmvScoreHistoryRow[];
  recentEvidence: Array<SmvEvidenceLogRow & { values: SmvEvidenceMetricValueRow[] }>;
  breakdown: Record<string, number>;
  suggestions: string[];
};
