import type { BloodDonationEventRow } from './types';

// Existing donation page's three-visit mission, intentionally distinct from the legacy summary.
export const BLOOD_DONATION_TARGET = 3;

export function getBloodDonationPageProgress(events: BloodDonationEventRow[]) {
  const completed = Math.min(events.filter((event) => event.status === 'completed').length, BLOOD_DONATION_TARGET);
  return { completed, total: BLOOD_DONATION_TARGET, percentage: Math.round(completed / BLOOD_DONATION_TARGET * 100) };
}
