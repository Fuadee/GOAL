import { GoalVisionBoard } from '@/components/dashboard/GoalVisionBoard';
import { MotionReveal } from '@/components/dashboard/MotionReveal';
import { UnifiedMissionCard } from '@/components/dashboard/UnifiedMissionCard';
import { Navbar } from '@/components/navbar';
import {
  getHealthUnifiedMissionCardData,
  getInnovationUnifiedMissionCardData,
  getMoneyUnifiedMissionCardData,
  getSmvUnifiedMissionCardData,
  getWorldUnifiedMissionCardData
} from '@/lib/dashboard/unified-mission';
import { getGoalVisionImages } from '@/lib/goal-vision/queries';
import { getGoalVisionPublicUrl } from '@/lib/goal-vision/storage';
import { getInnovationDashboardPageData } from '@/lib/innovation/service';
import { getConstructionProgressData } from '@/lib/money/service';
import { getRunnerDashboardData } from '@/lib/running/quest.server';
import { getSmvOverviewData } from '@/lib/smv/service';
import { getBloodDonationDashboardData } from '@/lib/blood-donation/service';

export default async function Home() {
  const [goalVisionImages, smvOverview, construction, healthDashboard, innovationDashboard, worldDashboard] = await Promise.all([
    getGoalVisionImages(),
    getSmvOverviewData(),
    getConstructionProgressData(),
    getRunnerDashboardData(),
    getInnovationDashboardPageData(),
    getBloodDonationDashboardData()
  ]);

  const initialVisionImages = goalVisionImages.map((row) => ({
    ...row,
    image_url: getGoalVisionPublicUrl(row.image_path)
  }));

  const missionCards = [
    getSmvUnifiedMissionCardData(smvOverview),
    getMoneyUnifiedMissionCardData(construction.steps),
    getHealthUnifiedMissionCardData(healthDashboard),
    getInnovationUnifiedMissionCardData(innovationDashboard.currentMission),
    getWorldUnifiedMissionCardData(worldDashboard)
  ];

  return (
    <main className="app-shell">
      <Navbar />

      <div className="page-container space-y-8">
        <MotionReveal>
          <section className="rounded-3xl border border-cyan-300/20 bg-slate-950/65 p-5 shadow-[0_0_30px_rgba(34,211,238,0.08)] md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">สิ่งที่ต้องทำตอนนี้</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">สิ่งที่ต้องทำตอนนี้</h2>
            <p className="mt-1 text-sm text-slate-300">ดึงภารกิจหลักจากแต่ละหมวดมาให้ดูรวมในที่เดียว</p>

            <div className="mt-5 grid gap-3 lg:grid-cols-5 md:grid-cols-2">
              {missionCards.map((card) => (
                <UnifiedMissionCard key={card.key} card={card} />
              ))}
            </div>
          </section>
        </MotionReveal>

        <MotionReveal>
          <GoalVisionBoard initialImages={initialVisionImages} />
        </MotionReveal>
      </div>
    </main>
  );
}
