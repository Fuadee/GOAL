export const SMV_DIMENSION_KEYS = [
  'confidence_leadership',
  'fun_playful',
  'preselection',
  'status_money',
  'social_connection',
  'life_goal',
  'protective_capable',
  'looks_style'
] as const;

export type SmvDimensionKey = (typeof SMV_DIMENSION_KEYS)[number];
export type SmvFrequencyType = 'daily' | 'repeatable' | 'one_time';
export type SmvScoreEventType = 'checklist' | 'manual_adjustment' | 'system_recalc';
export type SmvTrendDirection = 'up' | 'down' | 'flat';

export type SmvDimensionRow = {
  id: string;
  key: SmvDimensionKey;
  label: string;
  description: string | null;
  color_token: string | null;
  created_at: string;
};

export type SmvChecklistItemRow = {
  id: string;
  dimension_id: string;
  title: string;
  description: string | null;
  score_delta: number;
  frequency_type: SmvFrequencyType;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type SmvChecklistLogRow = {
  id: string;
  dimension_id: string;
  checklist_item_id: string;
  completed_at: string;
  notes: string | null;
  created_at: string;
};

export type SmvScoreEventRow = {
  id: string;
  dimension_id: string;
  event_type: SmvScoreEventType;
  score_before: number;
  score_delta: number;
  score_after: number;
  reason: string | null;
  checklist_log_id: string | null;
  created_at: string;
};

export type SmvDimensionScoreRow = {
  dimension_id: string;
  current_score: number;
  previous_score: number;
  updated_at: string;
};

export type SmvDimensionWithScore = {
  id: string;
  key: SmvDimensionKey;
  label: string;
  description: string | null;
  colorToken: string | null;
  currentScore: number;
  previousScore: number;
  trend: SmvTrendDirection;
  todayCompletedCount: number;
  weeklyCompletedCount: number;
  streakDays: number;
};

export type SmvHighlightData = {
  averageScore: number;
  strongestDimension: SmvDimensionWithScore | null;
  weakestDimension: SmvDimensionWithScore | null;
  strongestTwo: SmvDimensionWithScore[];
  weakestTwo: SmvDimensionWithScore[];
  focusNowMessage: string;
  aiRecommendationPlaceholder: string;
};

export type SmvDashboardData = {
  dimensions: SmvDimensionWithScore[];
  checklistItemsByDimension: Record<string, SmvChecklistItemRow[]>;
  recentLogsByDimension: Record<string, SmvChecklistLogRow[]>;
  selectedDimensionHistory: SmvScoreEventRow[];
  highlights: SmvHighlightData;
  activity: {
    todayCompletedCount: number;
    weeklyCompletedCount: number;
  };
};

export type CreateChecklistLogInput = {
  dimensionId: string;
  checklistItemId: string;
  notes?: string;
};

export type ManualAdjustDimensionScoreInput = {
  dimensionId: string;
  newScore: number;
  reason: string;
};
