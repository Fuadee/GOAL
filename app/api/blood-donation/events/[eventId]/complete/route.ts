import { NextResponse } from 'next/server';

import { markBloodDonationEventCompleted } from '@/lib/blood-donation/mutations';

export async function PATCH(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const body = await request.json();

    if (!body.actual_date) {
      return NextResponse.json({ error: 'actual_date is required' }, { status: 400 });
    }

    const updated = await markBloodDonationEventCompleted(params.eventId, {
      actual_date: body.actual_date,
      note: body.note
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to mark event completed' },
      { status: 500 }
    );
  }
}
