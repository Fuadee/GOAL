import { GoalVisionBoard } from '@/components/dashboard/GoalVisionBoard';
import { MotionReveal } from '@/components/dashboard/MotionReveal';
import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';
import { getGoalVisionImages } from '@/lib/goal-vision/queries';
import { getGoalVisionPublicUrl } from '@/lib/goal-vision/storage';
import { listPersonalTraits } from '@/lib/personal-traits/service';

export default async function Home() {
  const [goalVisionImages, personalTraits] = await Promise.all([
    getGoalVisionImages(),
    listPersonalTraits()
  ]);

  const initialVisionImages = goalVisionImages.map((row) => ({ ...row, image_url: getGoalVisionPublicUrl(row.image_path) }));

  return (
    <PageShell>
      <Navbar />
      <div className="page-container space-y-4 md:space-y-6">
        <MotionReveal>
          <GoalVisionBoard initialImages={initialVisionImages} initialTraits={personalTraits} />
        </MotionReveal>
      </div>
    </PageShell>
  );
}
