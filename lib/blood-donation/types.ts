export type BloodDonationGoalStatus = 'active' | 'completed' | 'archived';

export type BloodDonationEventStatus = 'planned' | 'completed' | 'missed' | 'cancelled';

export type BloodDonationDerivedEventStatus = BloodDonationEventStatus | 'overdue';

export type BloodDonationGoalRow = {
  id: string;
  title: string;
  target_count: number;
  start_date: string;
  end_date: string;
  status: BloodDonationGoalStatus;
  created_at: string;
  updated_at: string;
};

export type BloodDonationEventRow = {
  id: string;
  goal_id: string;
  planned_date: string | null;
  actual_date: string | null;
  status: BloodDonationEventStatus;
  location: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateBloodDonationGoalPayload = {
  title: string;
  target_count: number;
  start_date: string;
  end_date: string;
  status?: BloodDonationGoalStatus;
};

export type UpdateBloodDonationGoalPayload = Partial<CreateBloodDonationGoalPayload>;

export type CreatePlannedBloodDonationEventPayload = {
  goal_id: string;
  planned_date: string;
  location?: string;
  note?: string;
};

export type CreateCompletedBloodDonationEventPayload = {
  goal_id: string;
  actual_date: string;
  location?: string;
  note?: string;
  planned_date?: string;
};

export type MarkBloodDonationEventCompletedPayload = {
  actual_date: string;
  note?: string;
};

export type RescheduleBloodDonationEventPayload = {
  planned_date: string;
  location?: string;
  note?: string;
};

export type BloodDonationSummary = {
  targetCount: number;
  completedCount: number;
  plannedCount: number;
  missedCount: number;
  cancelledCount: number;
  remainingToTarget: number;
  progressPercent: number;
  nextPlannedDate: string | null;
  latestActualDate: string | null;
};

export type BloodDonationChanceLabel = 'สูงมาก' | 'สูง' | 'กลาง' | 'ต่ำ' | 'ยังไม่เริ่ม';

export type BloodDonationChanceResult = {
  score: number;
  label: BloodDonationChanceLabel;
  shortMessage: string;
  coachingMessage: string;
};

export type BloodDonationEventViewModel = BloodDonationEventRow & {
  derivedStatus: BloodDonationDerivedEventStatus;
  isOverdue: boolean;
};

export type BloodDonationDashboardViewModel = {
  goal: BloodDonationGoalRow | null;
  events: BloodDonationEventRow[];
  summary: BloodDonationSummary | null;
  chance: BloodDonationChanceResult | null;
  upcomingPlans: BloodDonationEventViewModel[];
  history: BloodDonationEventViewModel[];
};
