import { NextResponse } from 'next/server';

import { cancelBloodDonationEvent } from '@/lib/blood-donation/mutations';

export async function PATCH(_request: Request, { params }: { params: { eventId: string } }) {
  try {
    const updated = await cancelBloodDonationEvent(params.eventId);

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to cancel event' },
      { status: 500 }
    );
  }
}
