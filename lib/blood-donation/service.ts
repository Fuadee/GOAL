import {
  getBloodDonationHistory,
  getBloodDonationSummary,
  getChanceToReachBloodDonationGoal,
  getUpcomingBloodDonationPlans
} from '@/lib/blood-donation/logic';
import { getActiveBloodDonationGoal, getBloodDonationEventsByGoalId } from '@/lib/blood-donation/queries';
import { BloodDonationDashboardViewModel, BloodDonationReward } from '@/lib/blood-donation/types';

const defaultReward = (status: BloodDonationReward['status']): BloodDonationReward => ({
  title: 'Japanese Solo Reward',
  thaiTitle: 'มื้ออาหารญี่ปุ่นคนเดียวแบบภูมิใจ',
  description: 'หลังบริจาคเลือดสำเร็จ ให้รางวัลตัวเองด้วยมื้ออาหารญี่ปุ่นดี ๆ หนึ่งมื้อ',
  emotionalCopy: 'ไม่ใช่แค่กิน แต่คือการฉลองว่าฉันทำเรื่องดีสำเร็จแล้ว',
  imageUrl: '/rewards/japanese-solo-reward.jpg',
  status
});

export async function getBloodDonationDashboardData(today = new Date()): Promise<BloodDonationDashboardViewModel> {
  const goal = await getActiveBloodDonationGoal();

  if (!goal) {
    return {
      goal: null,
      events: [],
      summary: null,
      chance: null,
      upcomingPlans: [],
      history: [],
      reward: defaultReward('locked')
    };
  }

  const events = await getBloodDonationEventsByGoalId(goal.id);
  const hasCompleted = events.some((event) => event.status === 'completed');

  return {
    goal,
    events,
    summary: getBloodDonationSummary(goal, events, today),
    chance: getChanceToReachBloodDonationGoal(goal, events, today),
    upcomingPlans: getUpcomingBloodDonationPlans(events, today),
    history: getBloodDonationHistory(events),
    reward: defaultReward(hasCompleted ? 'unlocked' : 'locked')
  };
}
