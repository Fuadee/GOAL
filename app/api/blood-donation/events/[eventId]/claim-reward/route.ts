import { NextResponse } from 'next/server';

import { updateBloodDonationRewardStatus } from '@/lib/blood-donation/mutations';

export async function PATCH(_: Request, { params }: { params: { eventId: string } }) {
  try {
    const updated = await updateBloodDonationRewardStatus(params.eventId, 'claimed');
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to claim reward' },
      { status: 500 }
    );
  }
}
