import { GoalVisionBoard } from '@/components/dashboard/GoalVisionBoard';
import { MotionReveal } from '@/components/dashboard/MotionReveal';
import { Navbar } from '@/components/navbar';
import { getGoalVisionImages } from '@/lib/goal-vision/queries';
import { getGoalVisionPublicUrl } from '@/lib/goal-vision/storage';

export default async function Home() {
  const goalVisionImages = await getGoalVisionImages();
  const initialVisionImages = goalVisionImages.map((row) => ({
    ...row,
    image_url: getGoalVisionPublicUrl(row.image_path)
  }));

  return (
    <main className="app-shell">
      <Navbar />

      <div className="page-container">
        <MotionReveal>
          <GoalVisionBoard initialImages={initialVisionImages} />
        </MotionReveal>
      </div>
    </main>
  );
}
