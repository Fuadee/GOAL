import {
  getBloodDonationHistory,
  getBloodDonationSummary,
  getChanceToReachBloodDonationGoal,
  getUpcomingBloodDonationPlans
} from '@/lib/blood-donation/logic';
import { getActiveBloodDonationGoal, getBloodDonationEventsByGoalId } from '@/lib/blood-donation/queries';
import { BloodDonationDashboardViewModel } from '@/lib/blood-donation/types';

export async function getBloodDonationDashboardData(today = new Date()): Promise<BloodDonationDashboardViewModel> {
  const goal = await getActiveBloodDonationGoal();

  if (!goal) {
    return {
      goal: null,
      events: [],
      summary: null,
      chance: null,
      upcomingPlans: [],
      history: []
    };
  }

  const events = await getBloodDonationEventsByGoalId(goal.id);

  return {
    goal,
    events,
    summary: getBloodDonationSummary(goal, events, today),
    chance: getChanceToReachBloodDonationGoal(goal, events, today),
    upcomingPlans: getUpcomingBloodDonationPlans(events, today),
    history: getBloodDonationHistory(events)
  };
}
