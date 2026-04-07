import { BloodDonationDashboard } from '@/components/heal-world/blood-donation/BloodDonationDashboard';
import { getBloodDonationDashboardData } from '@/lib/blood-donation/service';

export async function BloodDonationSection() {
  const initialData = await getBloodDonationDashboardData();

  return <BloodDonationDashboard initialData={initialData} />;
}
