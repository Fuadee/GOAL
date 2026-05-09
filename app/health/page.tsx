import { Navbar } from '@/components/navbar';
import { RunnerQuestDashboard } from '@/components/health/RunnerQuestDashboard';
import { PageHeader, PageShell } from '@/components/ui/mission';
import { getRunnerDashboardData } from '@/lib/running/quest.server';

export default async function HealthPage() {
  const dashboard = await getRunnerDashboardData();

  return (
    <PageShell>
      <Navbar />
      <section className="page-container space-y-5">
        <PageHeader
          className="border-white/10 bg-gradient-to-br from-[#0F1B2E] to-[#07111F]"
          kicker="Health Performance"
          title="Fitness Mission Control"
          description="โฟกัสภารกิจวันนี้ให้ชัด แล้วเดินเกมฟิตเนสแบบมีวินัยและโมเมนตัม"
        />
        <RunnerQuestDashboard data={dashboard} />
      </section>
    </PageShell>
  );
}
