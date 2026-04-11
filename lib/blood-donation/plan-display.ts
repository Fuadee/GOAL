import { BloodDonationEventViewModel } from '@/lib/blood-donation/types';

export type BloodDonationPlanDisplayStatus =
  | 'CURRENT'
  | 'SOON'
  | 'UPCOMING'
  | 'TODAY'
  | 'OVERDUE'
  | 'COMPLETED'
  | 'CANCELLED';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const toDateOnly = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());

const parseDateOnly = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getCurrentBloodDonationPlan = (plans: BloodDonationEventViewModel[]): BloodDonationEventViewModel | null => {
  return (
    [...plans]
      .filter((plan) => plan.status !== 'completed' && plan.status !== 'cancelled' && Boolean(plan.planned_date))
      .sort((a, b) => (a.planned_date ?? '').localeCompare(b.planned_date ?? ''))[0] ?? null
  );
};

export const getDaysUntilPlan = (planDate: string | null, now: Date): number | null => {
  if (!planDate) return null;

  const plan = parseDateOnly(planDate);
  const today = toDateOnly(now);

  return Math.round((plan.getTime() - today.getTime()) / MS_PER_DAY);
};

export const getCountdownLabel = (planDate: string | null, now: Date): string => {
  const daysUntil = getDaysUntilPlan(planDate, now);

  if (daysUntil === null) return 'ยังไม่ระบุวัน';
  if (daysUntil === 0) return 'วันนี้';
  if (daysUntil > 0) return `อีก ${daysUntil} วัน`;

  return `เลยมาแล้ว ${Math.abs(daysUntil)} วัน`;
};

export const getBloodDonationPlanDisplayStatus = (
  plan: BloodDonationEventViewModel,
  currentPlan: BloodDonationEventViewModel | null,
  now: Date
): BloodDonationPlanDisplayStatus => {
  if (plan.status === 'completed') return 'COMPLETED';
  if (plan.status === 'cancelled') return 'CANCELLED';

  const daysUntil = getDaysUntilPlan(plan.planned_date, now);

  if (daysUntil === null) return 'UPCOMING';
  if (daysUntil < 0) return 'OVERDUE';
  if (daysUntil === 0) return 'TODAY';
  if (currentPlan?.id === plan.id) return 'CURRENT';
  if (daysUntil <= 7) return 'SOON';

  return 'UPCOMING';
};


export function getNextBloodDonationMissionSummary(plan: BloodDonationEventViewModel | null): { primaryText: string; secondaryText?: string } {
  if (!plan) {
    return {
      primaryText: 'ยังไม่มีแผนถัดไป',
      secondaryText: 'ครบทุกแผนแล้ว หรือยังไม่ได้สร้างแผนใหม่'
    };
  }

  return {
    primaryText: plan.planned_date ? `บริจาคเลือดวันที่ ${plan.planned_date}` : 'ยังไม่ระบุวัน',
    secondaryText: plan.location || undefined
  };
}
