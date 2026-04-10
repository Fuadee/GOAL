import { CriticalAlertsSection } from '@/components/dashboard/CriticalAlertsSection';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { FocusNowSection } from '@/components/dashboard/FocusNowSection';
import { GoalModuleGrid } from '@/components/dashboard/GoalModuleGrid';
import { LifeBalanceCard } from '@/components/dashboard/LifeBalanceCard';
import { LifeDirectionCard } from '@/components/dashboard/LifeDirectionCard';
import { MomentumSection } from '@/components/dashboard/MomentumSection';
import { MotionReveal } from '@/components/dashboard/MotionReveal';
import { Navbar } from '@/components/navbar';
import { getDashboardData } from '@/lib/dashboard/service';

export default async function Home() {
  const dashboard = await getDashboardData();
  const urgentAlerts = dashboard.alerts.filter((item) => item.severity === 'high').length;

  return (
    <main className="app-shell">
      <Navbar />

      <div className="page-container space-y-10">
        <MotionReveal>
          <DashboardHero
            lifeDirection={dashboard.lifeDirection}
            activeGoals={dashboard.activeGoals}
            urgentAlerts={urgentAlerts}
          />
        </MotionReveal>

        <MotionReveal delay={0.08}>
          <section className="grid gap-6 xl:grid-cols-2">
            <LifeDirectionCard summary={dashboard.lifeDirection} />
            <LifeBalanceCard
              points={dashboard.balancePoints}
              strongestAreas={dashboard.strongestAreas}
              weakestAreas={dashboard.weakestAreas}
            />
          </section>
        </MotionReveal>

        <MotionReveal delay={0.14}>
          <FocusNowSection items={dashboard.focusItems} />
        </MotionReveal>

        <MotionReveal delay={0.2}>
          <MomentumSection items={dashboard.momentum} />
        </MotionReveal>

        <MotionReveal delay={0.24}>
          <CriticalAlertsSection alerts={dashboard.alerts} />
        </MotionReveal>

        <MotionReveal delay={0.28}>
          <GoalModuleGrid modules={dashboard.modules} />
        </MotionReveal>
      </div>
    </main>
  );
}
