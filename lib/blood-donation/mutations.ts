import { supabaseRestRequest } from '@/lib/supabase/rest';
import {
  BloodDonationEventRow,
  BloodDonationGoalRow,
  CreateBloodDonationGoalPayload,
  CreateCompletedBloodDonationEventPayload,
  CreatePlannedBloodDonationEventPayload,
  MarkBloodDonationEventCompletedPayload,
  RescheduleBloodDonationEventPayload,
  UpdateBloodDonationGoalPayload
} from '@/lib/blood-donation/types';

export async function createBloodDonationGoal(payload: CreateBloodDonationGoalPayload): Promise<BloodDonationGoalRow> {
  const rows = await supabaseRestRequest<BloodDonationGoalRow[]>('blood_donation_goals', 'POST', payload);
  return rows[0];
}

export async function updateBloodDonationGoal(id: string, payload: UpdateBloodDonationGoalPayload): Promise<BloodDonationGoalRow> {
  const rows = await supabaseRestRequest<BloodDonationGoalRow[]>(`blood_donation_goals?id=eq.${id}`, 'PATCH', payload);
  return rows[0];
}

export async function createPlannedBloodDonationEvent(
  payload: CreatePlannedBloodDonationEventPayload
): Promise<BloodDonationEventRow> {
  const rows = await supabaseRestRequest<BloodDonationEventRow[]>('blood_donation_events', 'POST', {
    ...payload,
    status: 'planned'
  });

  return rows[0];
}

export async function createCompletedBloodDonationEvent(
  payload: CreateCompletedBloodDonationEventPayload
): Promise<BloodDonationEventRow> {
  const rows = await supabaseRestRequest<BloodDonationEventRow[]>('blood_donation_events', 'POST', {
    ...payload,
    status: 'completed'
  });

  return rows[0];
}

export async function markBloodDonationEventCompleted(
  id: string,
  payload: MarkBloodDonationEventCompletedPayload
): Promise<BloodDonationEventRow> {
  const rows = await supabaseRestRequest<BloodDonationEventRow[]>(`blood_donation_events?id=eq.${id}`, 'PATCH', {
    status: 'completed',
    actual_date: payload.actual_date,
    note: payload.note
  });

  return rows[0];
}

export async function rescheduleBloodDonationEvent(
  id: string,
  payload: RescheduleBloodDonationEventPayload
): Promise<BloodDonationEventRow> {
  const updatePayload = {
    status: 'planned',
    planned_date: payload.planned_date,
    location: payload.location,
    note: payload.note,
    reward_title: payload.reward_title,
    reward_thai_title: payload.reward_thai_title,
    reward_description: payload.reward_description,
    reward_emotional_copy: payload.reward_emotional_copy,
    reward_image_url: payload.reward_image_url,
    reward_status: payload.reward_status
  };

  console.log('[blood-donation] update table blood_donation_events', {
    where: `id=eq.${id}`,
    fields: Object.keys(updatePayload)
  });

  await supabaseRestRequest<BloodDonationEventRow[]>(`blood_donation_events?id=eq.${id}`, 'PATCH', updatePayload);

  const updatedRows = await supabaseRestRequest<BloodDonationEventRow[]>(`blood_donation_events?id=eq.${id}&limit=1`, 'GET');
  const updatedRow = updatedRows[0];

  console.log('[blood-donation] updated row from database', updatedRow);

  return updatedRow;
}

export async function cancelBloodDonationEvent(id: string): Promise<BloodDonationEventRow> {
  const rows = await supabaseRestRequest<BloodDonationEventRow[]>(`blood_donation_events?id=eq.${id}`, 'PATCH', {
    status: 'cancelled'
  });

  return rows[0];
}

export async function updateBloodDonationRewardStatus(id: string, rewardStatus: 'locked' | 'unlocked' | 'claimed'): Promise<BloodDonationEventRow> {
  const rows = await supabaseRestRequest<BloodDonationEventRow[]>(`blood_donation_events?id=eq.${id}`, 'PATCH', {
    reward_status: rewardStatus
  });

  return rows[0];
}
