import { CriticalAlertsSection } from '@/components/dashboard/CriticalAlertsSection';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { FocusNowSection } from '@/components/dashboard/FocusNowSection';
import { GoalModuleGrid } from '@/components/dashboard/GoalModuleGrid';
import { LifeBalanceCard } from '@/components/dashboard/LifeBalanceCard';
import { LifeDirectionCard } from '@/components/dashboard/LifeDirectionCard';
import { MomentumSection } from '@/components/dashboard/MomentumSection';
import { Navbar } from '@/components/navbar';
import { getDashboardData } from '@/lib/dashboard/service';

export default async function Home() {
  const dashboard = await getDashboardData();
  const urgentAlerts = dashboard.alerts.filter((item) => item.severity === 'high').length;

  return (
    <main className="app-shell">
      <Navbar />

      <div className="page-container space-y-6">
        <DashboardHero
          lifeDirection={dashboard.lifeDirection}
          activeGoals={dashboard.activeGoals}
          urgentAlerts={urgentAlerts}
        />

        <section className="grid gap-6 xl:grid-cols-2">
          <LifeDirectionCard summary={dashboard.lifeDirection} />
          <LifeBalanceCard
            points={dashboard.balancePoints}
            strongestAreas={dashboard.strongestAreas}
            weakestAreas={dashboard.weakestAreas}
          />
        </section>

        <FocusNowSection items={dashboard.focusItems} />
        <MomentumSection items={dashboard.momentum} />
        <CriticalAlertsSection alerts={dashboard.alerts} />
        <GoalModuleGrid modules={dashboard.modules} />
      </div>
    </main>
  );
}
