import { NextResponse } from 'next/server';

import { createCompletedBloodDonationEvent, createPlannedBloodDonationEvent } from '@/lib/blood-donation/mutations';

export async function POST(request: Request, { params }: { params: { goalId: string } }) {
  try {
    const body = await request.json();

    if (body.mode === 'completed') {
      if (!body.actual_date) {
        return NextResponse.json({ error: 'actual_date is required for completed event' }, { status: 400 });
      }

      const created = await createCompletedBloodDonationEvent({
        goal_id: params.goalId,
        actual_date: body.actual_date,
        location: body.location,
        note: body.note,
        planned_date: body.planned_date,
        reward_title: body.reward_title,
        reward_thai_title: body.reward_thai_title,
        reward_description: body.reward_description,
        reward_emotional_copy: body.reward_emotional_copy,
        reward_image_url: body.reward_image_url,
        reward_status: body.reward_status || 'unlocked'
      });

      return NextResponse.json(created);
    }

    if (!body.planned_date) {
      return NextResponse.json({ error: 'planned_date is required for planned event' }, { status: 400 });
    }

    const created = await createPlannedBloodDonationEvent({
      goal_id: params.goalId,
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

    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create blood donation event' },
      { status: 500 }
    );
  }
}
