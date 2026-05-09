import { Navbar } from '@/components/navbar';
import { RunnerQuestDashboard } from '@/components/health/RunnerQuestDashboard';
import { PageShell } from '@/components/ui/mission';
import { getRunnerDashboardData } from '@/lib/running/quest.server';

export default async function HealthPage() {
  const dashboard = await getRunnerDashboardData();

  return (
    <PageShell>
      <Navbar />
      <section className="page-container">
        <RunnerQuestDashboard data={dashboard} />
      </section>
    </PageShell>
  );
}
