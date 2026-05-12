import {
  getBloodDonationHistory,
  getBloodDonationSummary,
  getChanceToReachBloodDonationGoal,
  getUpcomingBloodDonationPlans
} from '@/lib/blood-donation/logic';
import { getActiveBloodDonationGoal, getBloodDonationEventsByGoalId } from '@/lib/blood-donation/queries';
import { BloodDonationDashboardViewModel, BloodDonationMission, BloodDonationReward } from '@/lib/blood-donation/types';
import { getCurrentBloodDonationPlan } from '@/lib/blood-donation/plan-display';

const createCurrentMission = (reward: BloodDonationReward | null): BloodDonationMission => ({
  id: 'blood-donation',
  title: 'บริจาคเลือดปีนี้',
  reward
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
  const persistedReward =
    currentPlan?.reward_title && currentPlan.reward_description
      ? {
          title: currentPlan.reward_title,
          thaiTitle: currentPlan.reward_thai_title ?? undefined,
          description: currentPlan.reward_description,
          emotionalCopy: currentPlan.reward_emotional_copy ?? undefined,
          imageUrl: currentPlan.reward_image_url ?? undefined,
          status: currentPlan.reward_status ?? 'locked'
        }
      : null;
  return {
    goal,
    events,
    summary: getBloodDonationSummary(goal, events, today),
    chance: getChanceToReachBloodDonationGoal(goal, events, today),
    upcomingPlans,
    history: getBloodDonationHistory(events),
    currentMission: createCurrentMission(persistedReward)
  };
}
