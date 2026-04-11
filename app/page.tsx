import { CriticalAlertsSection } from '@/components/dashboard/CriticalAlertsSection';
import { GoalModuleGrid } from '@/components/dashboard/GoalModuleGrid';
import { GoalVisionBoard } from '@/components/dashboard/GoalVisionBoard';
import { MotionReveal } from '@/components/dashboard/MotionReveal';
import { Navbar } from '@/components/navbar';
import { getGoalVisionImages } from '@/lib/goal-vision/queries';
import { getGoalVisionPublicUrl } from '@/lib/goal-vision/storage';
import { getDashboardData } from '@/lib/dashboard/service';

export default async function Home() {
  const dashboard = await getDashboardData();
  const goalVisionImages = await getGoalVisionImages();
  const initialVisionImages = goalVisionImages.map((row) => ({
    ...row,
    image_url: getGoalVisionPublicUrl(row.image_path)
  }));

  return (
    <main className="app-shell">
      <Navbar />

      <div className="page-container space-y-10">
        <MotionReveal>
          <GoalVisionBoard initialImages={initialVisionImages} />
        </MotionReveal>

        <MotionReveal delay={0.14}>
          <CriticalAlertsSection alerts={dashboard.alerts} />
        </MotionReveal>

        <MotionReveal delay={0.24}>
          <GoalModuleGrid modules={dashboard.modules} />
        </MotionReveal>
      </div>
    </main>
  );
}
