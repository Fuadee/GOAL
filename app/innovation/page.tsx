import { DiscoveryCandidatesSection } from '@/components/innovation/DiscoveryCandidatesSection';
import { CompletedAppsSection } from '@/components/innovation/CompletedAppsSection';
import { InnovationPrimaryGoalCard } from '@/components/innovation/InnovationPrimaryGoalCard';
import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';
import { getGoalVisionImages } from '@/lib/goal-vision/queries';
import { getGoalVisionPublicUrl } from '@/lib/goal-vision/storage';
import { getInnovationDashboardPageData } from '@/lib/innovation/service';
import { deriveInnovationState } from '@/lib/innovation/helpers';

const TARGET_INNOVATIONS = 10;

export default async function InnovationPage() {
  const [{ innovations, discoveryCandidates }, goalVisionImages] = await Promise.all([
    getInnovationDashboardPageData(TARGET_INNOVATIONS),
    getGoalVisionImages()
  ]);
  const completedInnovations = innovations
    .filter((innovation) => deriveInnovationState(innovation) === 'completed')
    .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime());
  const innovationVisionImage = goalVisionImages.find((image) => image.goal_key === 'innovation');

  return (
    <PageShell>
      <Navbar />
      <section className="page-container space-y-5 sm:space-y-6">
        <InnovationPrimaryGoalCard
          completedCount={completedInnovations.length}
          targetCount={TARGET_INNOVATIONS}
          imageUrl={innovationVisionImage ? getGoalVisionPublicUrl(innovationVisionImage.image_path) : null}
        />

        <DiscoveryCandidatesSection candidates={discoveryCandidates} />

        <CompletedAppsSection apps={completedInnovations} />
      </section>
    </PageShell>
  );
}
