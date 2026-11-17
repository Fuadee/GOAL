import { Navbar } from '@/components/navbar';
import { BloodDonationDashboard } from '@/components/heal-world/blood-donation/BloodDonationDashboard';
import { PageShell } from '@/components/ui/mission';
import { getBloodDonationDashboardData } from '@/lib/blood-donation/service';

export default async function HealWorldPage() {
  const initialData = await getBloodDonationDashboardData();

  return (
    <PageShell>
      <Navbar />
      <section className="page-container space-y-5 pt-2 md:pt-3">
        <BloodDonationDashboard initialData={initialData} />
      </section>
    </PageShell>
  );
}
