import { Navbar } from '@/components/navbar';
import { BloodDonationDashboard } from '@/components/heal-world/blood-donation/BloodDonationDashboard';
import { PageHeader, PageShell } from '@/components/ui/mission';
import { getBloodDonationDashboardData } from '@/lib/blood-donation/service';

export default async function HealWorldPage() {
  const initialData = await getBloodDonationDashboardData();

  return (
    <PageShell>
      <Navbar />
      <section className="page-container space-y-8">
        <PageHeader
          kicker="Heal the World"
          title="Impact Mission: Blood Donation"
          description="ติดตามแผนบริจาค การลงมือจริง และทิศทางการไปถึงเป้าหมายอย่างมีความหมาย"
        />
        <BloodDonationDashboard initialData={initialData} />
      </section>
    </PageShell>
  );
}
