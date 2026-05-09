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
import { listPersonalTraits } from '@/lib/personal-traits/service';
import { getRunnerDashboardData } from '@/lib/running/quest.server';
import { getSmvOverviewData } from '@/lib/smv/service';
import { getBloodDonationDashboardData } from '@/lib/blood-donation/service';

export default async function Home() {
  const [goalVisionImages, personalTraits, smvOverview, construction, healthDashboard, innovationDashboard, worldDashboard] = await Promise.all([
    getGoalVisionImages(),
    listPersonalTraits(),
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
      <div className="page-container space-y-4 md:space-y-6">
        <MotionReveal>
          <GoalVisionBoard initialImages={initialVisionImages} initialTraits={personalTraits} />
        </MotionReveal>

        <MotionReveal>
          <section className="mission-card space-y-3 p-4 md:space-y-4 md:p-6">
            <SectionHeader
              title="Current Focus: วันนี้ต้องทำอะไรต่อ"
              subtitle="Command bar สำหรับ 5 ระบบหลัก — เลือก mission แล้วลงมือทันที"
              titleClassName="text-base text-slate-900 md:text-xl"
              subtitleClassName="text-xs text-slate-500"
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {missionCards.map((card) => (
                <UnifiedMissionCard key={card.key} card={card} />
              ))}
            </div>
          </section>
        </MotionReveal>
      </div>
    </PageShell>
  );
}
