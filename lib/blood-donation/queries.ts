import { supabaseRestRequest } from '@/lib/supabase/rest';
import { BloodDonationEventRow, BloodDonationGoalRow } from '@/lib/blood-donation/types';

export async function getActiveBloodDonationGoal(): Promise<BloodDonationGoalRow | null> {
  const rows = await supabaseRestRequest<BloodDonationGoalRow[]>(
    'blood_donation_goals?status=eq.active&order=start_date.desc&limit=1',
    'GET'
  );

  return rows[0] ?? null;
}

export async function getBloodDonationGoalById(id: string): Promise<BloodDonationGoalRow | null> {
  const rows = await supabaseRestRequest<BloodDonationGoalRow[]>(`blood_donation_goals?id=eq.${id}&limit=1`, 'GET');

  return rows[0] ?? null;
}

export async function getBloodDonationEventsByGoalId(goalId: string): Promise<BloodDonationEventRow[]> {
  return supabaseRestRequest<BloodDonationEventRow[]>(
    `blood_donation_events?goal_id=eq.${goalId}&order=created_at.desc`,
    'GET'
  );
}
