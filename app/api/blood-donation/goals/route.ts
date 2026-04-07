import { NextResponse } from 'next/server';

import { createBloodDonationGoal } from '@/lib/blood-donation/mutations';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.start_date || !body.end_date) {
      return NextResponse.json({ error: 'title, start_date, end_date are required' }, { status: 400 });
    }

    const created = await createBloodDonationGoal({
      title: body.title,
      target_count: Number(body.target_count ?? 3),
      start_date: body.start_date,
      end_date: body.end_date,
      status: 'active'
    });

    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create blood donation goal' },
      { status: 500 }
    );
  }
}
