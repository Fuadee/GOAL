import {
  getBloodDonationHistory,
  getBloodDonationSummary,
  getChanceToReachBloodDonationGoal,
  getUpcomingBloodDonationPlans
} from '@/lib/blood-donation/logic';
import { getActiveBloodDonationGoal, getBloodDonationEventsByGoalId } from '@/lib/blood-donation/queries';
import { BloodDonationDashboardViewModel, BloodDonationMission, BloodDonationReward } from '@/lib/blood-donation/types';
import { getCurrentBloodDonationPlan } from '@/lib/blood-donation/plan-display';

const defaultReward = (status: BloodDonationReward['status']): BloodDonationReward => ({
  title: 'Japanese Solo Reward',
  thaiTitle: 'มื้ออาหารญี่ปุ่นคนเดียวแบบภูมิใจ',
  description: 'หลังบริจาคเลือดสำเร็จ ให้รางวัลตัวเองด้วยมื้ออาหารญี่ปุ่นดี ๆ หนึ่งมื้อ',
  emotionalCopy: 'ไม่ใช่แค่กิน แต่คือการฉลองว่าฉันทำเรื่องดีสำเร็จแล้ว',
  imageUrl: '/rewards/japanese-solo-reward.jpg',
  status
});

const createCurrentMission = (status: BloodDonationReward['status']): BloodDonationMission => ({
  id: 'blood-donation',
  title: 'บริจาคเลือดปีนี้',
  reward: defaultReward(status)
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
      currentMission: null
    };
  }

  const events = await getBloodDonationEventsByGoalId(goal.id);
  const upcomingPlans = getUpcomingBloodDonationPlans(events, today);
  const currentPlan = getCurrentBloodDonationPlan(upcomingPlans);
  const missionRewardStatus: BloodDonationReward['status'] = currentPlan?.status === 'completed' ? 'unlocked' : 'locked';

  return {
    goal,
    events,
    summary: getBloodDonationSummary(goal, events, today),
    chance: getChanceToReachBloodDonationGoal(goal, events, today),
    upcomingPlans,
    history: getBloodDonationHistory(events),
    currentMission: createCurrentMission(missionRewardStatus)
  };
}
