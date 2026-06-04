import { supabaseRestRequest } from '@/lib/supabase/rest';
import { BloodDonationEventRow, BloodDonationGoalRow } from '@/lib/blood-donation/types';

export async function getActiveBloodDonationGoal(): Promise<BloodDonationGoalRow | null> {
  const rows = await supabaseRestRequest<BloodDonationGoalRow[]>(
    'blood_donation_goals?select=id,title,target_count,start_date,end_date,status,created_at,updated_at&status=eq.active&order=start_date.desc&limit=1',
    'GET'
  );

  return rows[0] ?? null;
}

export async function getBloodDonationGoalById(id: string): Promise<BloodDonationGoalRow | null> {
  const rows = await supabaseRestRequest<BloodDonationGoalRow[]>(`blood_donation_goals?select=id,title,target_count,start_date,end_date,status,created_at,updated_at&id=eq.${id}&limit=1`, 'GET');

  return rows[0] ?? null;
}

export async function getBloodDonationEventsByGoalId(goalId: string): Promise<BloodDonationEventRow[]> {
  return supabaseRestRequest<BloodDonationEventRow[]>(
    `blood_donation_events?select=id,goal_id,planned_date,actual_date,status,location,note,reward_title,reward_thai_title,reward_description,reward_emotional_copy,reward_image_url,reward_status,created_at,updated_at&goal_id=eq.${goalId}&order=created_at.desc&limit=100`,
    'GET'
  );
}
