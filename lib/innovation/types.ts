export const INNOVATION_STATUS = ['idea', 'building', 'testing', 'blocked', 'completed'] as const;
export const INNOVATION_LOG_TYPES = ['update', 'problem', 'solution', 'decision', 'lesson'] as const;
export const INNOVATION_STEP_STATUS = ['todo', 'in_progress', 'done'] as const;

export type InnovationStatus = (typeof INNOVATION_STATUS)[number];
export type InnovationLogType = (typeof INNOVATION_LOG_TYPES)[number];
export type InnovationStepStatus = (typeof INNOVATION_STEP_STATUS)[number];

export type InnovationRow = {
  id: string;
  title: string;
  description: string | null;
  goal: string | null;
  status: InnovationStatus;
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

export type InnovationDashboardRow = InnovationRow & {
  innovation_process_steps: Pick<InnovationProcessStepRow, 'status'>[];
};

export type InnovationCardViewModel = InnovationRow & {
  stepTotal: number;
  completedStepCount: number;
  progressPercent: number;
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
