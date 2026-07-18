import { Navbar } from '@/components/navbar';
import { SmvProjectsClient } from '@/components/smv/SmvProjectsClient';
import { getGoalVisionImages } from '@/lib/goal-vision/queries';
import { getGoalVisionPublicUrl } from '@/lib/goal-vision/storage';
import { getSmvProjects } from '@/lib/smv/projects';

export default async function SmvOverviewPage() {
  const [projects, goalVisionImages] = await Promise.all([
    getSmvProjects(),
    getGoalVisionImages()
  ]);
  const smvVisionImage = goalVisionImages.find((image) => image.goal_key === 'smv');

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <SmvProjectsClient
        initialProjects={projects}
        goalImageUrl={smvVisionImage ? getGoalVisionPublicUrl(smvVisionImage.image_path) : null}
      />
    </main>
  );
}
