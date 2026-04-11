import { GoalVisionBoard } from '@/components/dashboard/GoalVisionBoard';
import { MotionReveal } from '@/components/dashboard/MotionReveal';
import { UnifiedMissionCard } from '@/components/dashboard/UnifiedMissionCard';
import { Navbar } from '@/components/navbar';
import { PageShell, SectionHeader } from '@/components/ui/mission';
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

  const initialVisionImages = goalVisionImages.map((row) => ({ ...row, image_url: getGoalVisionPublicUrl(row.image_path) }));

  const missionCards = [
    getSmvUnifiedMissionCardData(smvOverview),
    getMoneyUnifiedMissionCardData(construction.steps),
    getHealthUnifiedMissionCardData(healthDashboard),
    getInnovationUnifiedMissionCardData(innovationDashboard.currentMission),
    getWorldUnifiedMissionCardData(worldDashboard)
  ];

  return (
    <PageShell>
      <Navbar />
      <div className="page-container space-y-8 md:space-y-10">
        <MotionReveal>
          <section className="hero-panel space-y-5">
            <SectionHeader
              title="สิ่งที่ต้องทำตอนนี้"
              subtitle="ภารกิจสำคัญจากทั้ง 5 ระบบ เพื่อให้คุณโฟกัสสิ่งที่ควรทำก่อนทันที"
            />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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
    </PageShell>
  );
}
