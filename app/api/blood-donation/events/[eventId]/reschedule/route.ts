import { NextResponse } from 'next/server';

import { rescheduleBloodDonationEvent } from '@/lib/blood-donation/mutations';

export async function PATCH(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const body = await request.json();

    if (!body.planned_date) {
      return NextResponse.json({ error: 'planned_date is required' }, { status: 400 });
    }

    const updated = await rescheduleBloodDonationEvent(params.eventId, {
      planned_date: body.planned_date,
      location: body.location,
      note: body.note,
      reward_title: body.reward_title,
      reward_thai_title: body.reward_thai_title,
      reward_description: body.reward_description,
      reward_emotional_copy: body.reward_emotional_copy,
      reward_image_url: body.reward_image_url,
      reward_status: body.reward_status || 'locked'
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to reschedule event' },
      { status: 500 }
    );
  }
}
