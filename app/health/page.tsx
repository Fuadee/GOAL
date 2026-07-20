import { Navbar } from '@/components/navbar';
import { RunnerQuestDashboard } from '@/components/health/RunnerQuestDashboard';
import { PageShell } from '@/components/ui/mission';
import { getGoalVisionImages } from '@/lib/goal-vision/queries';
import { getGoalVisionPublicUrl } from '@/lib/goal-vision/storage';
import { getRunnerDashboardData } from '@/lib/running/quest.server';

export default async function HealthPage() {
  const [dashboard, goalVisionImages] = await Promise.all([
    getRunnerDashboardData(),
    getGoalVisionImages()
  ]);
  const healthVisionImage = goalVisionImages.find((image) => image.goal_key === 'health');

  return (
    <PageShell>
      <Navbar />
      <section className="page-container">
        <RunnerQuestDashboard
          data={dashboard}
          goalImageUrl={healthVisionImage ? getGoalVisionPublicUrl(healthVisionImage.image_path) : null}
        />
      </section>
    </PageShell>
  );
}
