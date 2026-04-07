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
  const rows = await supabaseRestRequest<BloodDonationEventRow[]>(`blood_donation_events?id=eq.${id}`, 'PATCH', {
    status: 'planned',
    planned_date: payload.planned_date,
    location: payload.location,
    note: payload.note
  });

  return rows[0];
}

export async function cancelBloodDonationEvent(id: string): Promise<BloodDonationEventRow> {
  const rows = await supabaseRestRequest<BloodDonationEventRow[]>(`blood_donation_events?id=eq.${id}`, 'PATCH', {
    status: 'cancelled'
  });

  return rows[0];
}
