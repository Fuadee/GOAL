import {
  BloodDonationChanceResult,
  BloodDonationDerivedEventStatus,
  BloodDonationEventRow,
  BloodDonationEventViewModel,
  BloodDonationGoalRow,
  BloodDonationSummary
} from '@/lib/blood-donation/types';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const parseDateOnly = (date: string) => new Date(`${date}T00:00:00Z`);

const daysBetween = (start: Date, end: Date) => Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

const toDateOnly = (date: Date) => date.toISOString().slice(0, 10);

export const getDerivedBloodDonationEventStatus = (
  event: BloodDonationEventRow,
  today: Date
): BloodDonationDerivedEventStatus => {
  const todayDateOnly = toDateOnly(today);

  if (event.status === 'planned' && event.planned_date && event.planned_date < todayDateOnly && !event.actual_date) {
    return 'overdue';
  }

  return event.status;
};

export const getBloodDonationSummary = (
  goal: BloodDonationGoalRow,
  events: BloodDonationEventRow[],
  today: Date
): BloodDonationSummary => {
  const completedEvents = events.filter((event) => event.status === 'completed' && Boolean(event.actual_date));
  const plannedEvents = events.filter((event) => event.status === 'planned');
  const missedCount = events.filter((event) => event.status === 'missed').length;
  const cancelledCount = events.filter((event) => event.status === 'cancelled').length;

  const nextPlannedDate = plannedEvents
    .map((event) => event.planned_date)
    .filter((date): date is string => Boolean(date) && date >= toDateOnly(today))
    .sort((a, b) => a.localeCompare(b))[0] ?? null;

  const latestActualDate = completedEvents
    .map((event) => event.actual_date)
    .filter((date): date is string => Boolean(date))
    .sort((a, b) => b.localeCompare(a))[0] ?? null;

  const completedCount = completedEvents.length;
  const plannedCount = plannedEvents.length;
  const remainingToTarget = Math.max(goal.target_count - completedCount, 0);

  return {
    targetCount: goal.target_count,
    completedCount,
    plannedCount,
    missedCount,
    cancelledCount,
    remainingToTarget,
    progressPercent: clamp(Math.round((completedCount / goal.target_count) * 100), 0, 100),
    nextPlannedDate,
    latestActualDate
  };
};

export const getUpcomingBloodDonationPlans = (events: BloodDonationEventRow[], today: Date): BloodDonationEventViewModel[] => {
  return events
    .filter((event) => event.status === 'planned' && event.planned_date)
    .map((event) => {
      const derivedStatus = getDerivedBloodDonationEventStatus(event, today);

      return {
        ...event,
        derivedStatus,
        isOverdue: derivedStatus === 'overdue'
      };
    })
    .sort((a, b) => (a.planned_date ?? '').localeCompare(b.planned_date ?? ''));
};

export const getBloodDonationHistory = (events: BloodDonationEventRow[]): BloodDonationEventViewModel[] => {
  return events
    .filter((event) => event.status === 'completed')
    .map((event) => ({
      ...event,
      derivedStatus: 'completed',
      isOverdue: false
    }))
    .sort((a, b) => {
      if (a.actual_date && b.actual_date) {
        return b.actual_date.localeCompare(a.actual_date);
      }

      return b.created_at.localeCompare(a.created_at);
    });
};

export const getChanceToReachBloodDonationGoal = (
  goal: BloodDonationGoalRow,
  events: BloodDonationEventRow[],
  today: Date
): BloodDonationChanceResult => {
  const summary = getBloodDonationSummary(goal, events, today);

  if (summary.completedCount >= summary.targetCount) {
    return {
      score: 100,
      label: 'สูงมาก',
      shortMessage: 'ถึงเป้าหมายแล้ว',
      coachingMessage: 'ยอดเยี่ยม! คุณบริจาคครบตามเป้าหมายแล้ว รักษาวินัยนี้ต่อเนื่องได้เลย'
    };
  }

  if (summary.completedCount === 0 && summary.plannedCount === 0) {
    return {
      score: 8,
      label: 'ยังไม่เริ่ม',
      shortMessage: 'ยังไม่มีแผนการบริจาค',
      coachingMessage: 'เริ่มจากเพิ่มวันที่วางแผนครั้งแรก เพื่อสร้าง momentum ให้ระบบติดตามได้'
    };
  }

  const completedRatio = summary.completedCount / summary.targetCount;
  const plannedCoverage = Math.min(summary.plannedCount, summary.remainingToTarget) / summary.targetCount;

  const periodDays = Math.max(daysBetween(parseDateOnly(goal.start_date), parseDateOnly(goal.end_date)) + 1, 1);
  const daysLeft = daysBetween(today, parseDateOnly(goal.end_date));
  const timeFactor = clamp(daysLeft / periodDays, 0, 1);

  const overdueCount = getUpcomingBloodDonationPlans(events, today).filter((event) => event.isOverdue).length;

  let score = completedRatio * 70 + plannedCoverage * 25 + timeFactor * 15;
  score -= overdueCount * 6;

  if (daysLeft <= 0 && summary.remainingToTarget > 0) {
    score = Math.min(score, 20);
  } else if (daysLeft < 30 && summary.remainingToTarget >= 2) {
    score -= 10;
  }

  const normalizedScore = clamp(Math.round(score), 0, 100);

  if (normalizedScore >= 80) {
    return {
      score: normalizedScore,
      label: 'สูงมาก',
      shortMessage: 'โอกาสถึงเป้าหมายสูงมาก',
      coachingMessage: 'คุณอยู่ในจังหวะที่ดีมาก ให้รักษาแผนที่มีและยืนยันวันบริจาคล่วงหน้า'
    };
  }

  if (normalizedScore >= 60) {
    return {
      score: normalizedScore,
      label: 'สูง',
      shortMessage: 'มีโอกาสไปถึงเป้าหมาย',
      coachingMessage: 'เพิ่มแผนสำรองอีก 1 วัน และปิดงาน planned ให้กลายเป็น completed ต่อเนื่อง'
    };
  }

  if (normalizedScore >= 40) {
    return {
      score: normalizedScore,
      label: 'กลาง',
      shortMessage: 'ยังต้องเร่งตามแผน',
      coachingMessage: 'ลองกำหนดวันบริจาคถัดไปทันทีในเดือนนี้ เพื่อเพิ่มโอกาสแตะเป้าหมาย'
    };
  }

  return {
    score: normalizedScore,
    label: 'ต่ำ',
    shortMessage: 'ความเสี่ยงพลาดเป้าหมาย',
    coachingMessage: 'เวลาที่เหลือค่อนข้างน้อย แนะนำเพิ่มแผนใหม่และทำรายการค้างให้เสร็จเร็วที่สุด'
  };
};
