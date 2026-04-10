export const INNOVATION_STATUS = ['idea', 'building', 'testing', 'blocked', 'completed'] as const;
export const INNOVATION_LOG_TYPES = ['update', 'problem', 'solution', 'decision', 'lesson'] as const;
export const INNOVATION_STEP_STATUS = ['todo', 'in_progress', 'done'] as const;
export const DISCOVERY_CANDIDATE_STATUS = ['observed', 'pain_point', 'concept', 'validated', 'converted'] as const;

export type InnovationStatus = (typeof INNOVATION_STATUS)[number];
export type InnovationLogType = (typeof INNOVATION_LOG_TYPES)[number];
export type InnovationStepStatus = (typeof INNOVATION_STEP_STATUS)[number];
export type DiscoveryCandidateStatus = (typeof DISCOVERY_CANDIDATE_STATUS)[number];

export type DiscoveryCandidateState = 'observed' | 'pain_point' | 'concept' | 'validated' | 'converted';
export type DiscoveryCandidateStateAction =
  | 'define_problem'
  | 'delete_candidate'
  | 'add_concept'
  | 'edit_problem'
  | 'mark_validated'
  | 'edit_concept'
  | 'convert_to_innovation'
  | 'edit_validation_notes'
  | 'open_innovation';

export type InnovationDerivedState = 'idea' | 'building' | 'blocked' | 'completed';
export type InnovationStateAction =
  | 'add_first_step'
  | 'edit_innovation'
  | 'mark_next_step_done'
  | 'add_step'
  | 'open_details'
  | 'block'
  | 'resume'
  | 'edit_block_reason'
  | 'create_follow_up';

export type DiscoveryCandidateStateMeta = {
  state: DiscoveryCandidateState;
  label: string;
  description: string;
  allowedActions: DiscoveryCandidateStateAction[];
};

export type InnovationStateMeta = {
  state: InnovationDerivedState;
  label: string;
  description: string;
  allowedActions: InnovationStateAction[];
};

export type InnovationRow = {
  id: string;
  title: string;
  description: string | null;
  goal: string | null;
  status: InnovationStatus;
  is_blocked: boolean;
  blocked_reason: string | null;
  blocked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InnovationProcessStepRow = {
  id: string;
  innovation_id: string;
  title: string;
  description: string | null;
  step_order: number | null;
  status: InnovationStepStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InnovationProcessStepSummary = Pick<InnovationProcessStepRow, 'id' | 'title' | 'status' | 'step_order' | 'created_at'>;

export type InnovationLogRow = {
  id: string;
  innovation_id: string;
  log_type: InnovationLogType;
  title: string;
  detail: string | null;
  problem: string | null;
  solution: string | null;
  result: string | null;
  lesson_learned: string | null;
  next_step: string | null;
  created_at: string;
};

export type DiscoveryCandidateRow = {
  id: string;
  title: string;
  problem: string | null;
  concept: string | null;
  validation_notes: string | null;
  validated_at: string | null;
  converted_at: string | null;
  converted_innovation_id: string | null;
  source: string | null;
  impact_score: number;
  feasibility_score: number;
  status: DiscoveryCandidateStatus;
  notes: string | null;
  created_at: string;
};

export type InnovationDashboardRow = InnovationRow & {
  innovation_process_steps: InnovationProcessStepSummary[];
};

export type InnovationCardViewModel = InnovationRow & {
  stepTotal: number;
  completedStepCount: number;
  progressPercent: number;
  steps: InnovationProcessStepSummary[];
  nextStep: InnovationProcessStepSummary | null;
};

export type InnovationDetailViewModel = {
  innovation: InnovationRow;
  steps: InnovationProcessStepRow[];
  logs: InnovationLogRow[];
  completedStepCount: number;
  progressPercent: number;
};

export type CreateInnovationPayload = {
  title: string;
  description?: string;
  goal?: string;
};

export type CreateInnovationProcessStepPayload = {
  innovation_id: string;
  title: string;
  description?: string;
  step_order?: number;
};

export type UpdateInnovationPayload = {
  is_blocked?: boolean;
  blocked_reason?: string | null;
  blocked_at?: string | null;
  status?: InnovationStatus;
};

export type UpdateInnovationProcessStepPayload = {
  status?: InnovationStepStatus;
  completed_at?: string | null;
};

export type CreateInnovationLogPayload = {
  innovation_id: string;
  log_type: InnovationLogType;
  title: string;
  detail?: string;
  problem?: string;
  solution?: string;
  result?: string;
  lesson_learned?: string;
  next_step?: string;
};

export type CreateDiscoveryCandidatePayload = {
  title: string;
  problem?: string;
  concept?: string;
  source?: string;
  impact_score?: number;
  feasibility_score?: number;
  notes?: string;
};

export type UpdateDiscoveryCandidatePayload = {
  problem?: string;
  concept?: string;
  validation_notes?: string | null;
  validated_at?: string | null;
  converted_at?: string | null;
  converted_innovation_id?: string | null;
};
