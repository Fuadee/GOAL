import { Navbar } from '@/components/navbar';
import { BloodDonationDashboard } from '@/components/heal-world/blood-donation/BloodDonationDashboard';
import { PageShell } from '@/components/ui/mission';
import { getBloodDonationDashboardData } from '@/lib/blood-donation/service';
import { getGoalVisionImages } from '@/lib/goal-vision/queries';
import { getGoalVisionPublicUrl } from '@/lib/goal-vision/storage';

export default async function HealWorldPage() {
  const [initialData, goalVisionImages] = await Promise.all([
    getBloodDonationDashboardData(),
    getGoalVisionImages()
  ]);
  const worldVisionImage = goalVisionImages.find((image) => image.goal_key === 'world');

  return (
    <PageShell>
      <Navbar />
      <section className="page-container space-y-5 pt-2 md:pt-3">
        <BloodDonationDashboard
          initialData={initialData}
          goalImageUrl={worldVisionImage ? getGoalVisionPublicUrl(worldVisionImage.image_path) : null}
        />
      </section>
    </PageShell>
  );
}
