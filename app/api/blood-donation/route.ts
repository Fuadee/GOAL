import { NextResponse } from 'next/server';

import { getBloodDonationDashboardData } from '@/lib/blood-donation/service';

export async function GET() {
  try {
    const data = await getBloodDonationDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error while loading blood donation data' },
      { status: 500 }
    );
  }
}
