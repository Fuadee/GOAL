export const INNOVATION_STATUS = ['idea', 'building', 'testing', 'blocked', 'completed'] as const;

export const INNOVATION_LOG_TYPES = ['update', 'problem', 'solution', 'decision', 'lesson'] as const;

export type InnovationStatus = (typeof INNOVATION_STATUS)[number];
export type InnovationLogType = (typeof INNOVATION_LOG_TYPES)[number];

export type InnovationRow = {
  id: string;
  title: string;
  description: string | null;
  goal: string | null;
  status: InnovationStatus;
  progress_percent: number;
  started_at: string | null;
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

export type InnovationWithLogCountRow = InnovationRow & {
  innovation_logs: { count: number }[];
};

export type InnovationCardViewModel = InnovationRow & {
  logCount: number;
};

export type CreateInnovationPayload = {
  title: string;
  description?: string;
  goal?: string;
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

export type UpdateInnovationPayload = Partial<
  Pick<InnovationRow, 'status' | 'progress_percent' | 'started_at' | 'completed_at' | 'updated_at'>
>;
