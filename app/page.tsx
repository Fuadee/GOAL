import Link from 'next/link';

import { GoalVisionBoard } from '@/components/dashboard/GoalVisionBoard';
import { MotionReveal } from '@/components/dashboard/MotionReveal';
import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';
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

  const focusItems = [
    getSmvUnifiedMissionCardData(smvOverview),
    getMoneyUnifiedMissionCardData(construction.steps),
    getHealthUnifiedMissionCardData(healthDashboard),
    getInnovationUnifiedMissionCardData(innovationDashboard.currentMission),
    getWorldUnifiedMissionCardData(worldDashboard)
  ].slice(0, 3);

  return (
    <PageShell>
      <Navbar />
      <div className="page-container space-y-8 md:space-y-10">
        <MotionReveal>
          <GoalVisionBoard initialImages={initialVisionImages} initialTraits={personalTraits} />
        </MotionReveal>

        <MotionReveal>
          <section className="rounded-[24px] border border-white/10 bg-[#10141b] p-5 md:p-7">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#c2a56d]">Current Focus</p>
            <h2 className="mt-2 text-2xl font-medium text-[#f1f0ec] md:text-3xl">Today, only what truly matters.</h2>
            <p className="mt-1 text-sm text-[#a9aaa7]">Choose one path now. Keep the rest quiet.</p>

            <div className="mt-6 space-y-2">
              {focusItems.map((item) => (
                <Link key={item.key} href={item.href} className="group flex items-center justify-between rounded-xl border border-transparent px-2 py-3 transition hover:border-white/10 hover:bg-white/[0.02]">
                  <div>
                    <p className="text-sm text-[#8f948f]">{item.label}</p>
                    <p className="text-base text-[#ecebe8]">{item.title}</p>
                  </div>
                  <span className="text-xs text-[#c2a56d]">Open</span>
                </Link>
              ))}
            </div>
          </section>
        </MotionReveal>
      </div>
    </PageShell>
  );
}
