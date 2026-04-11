import { Navbar } from '@/components/navbar';
import { RunnerQuestDashboard } from '@/components/health/RunnerQuestDashboard';
import { PageHeader, PageShell } from '@/components/ui/mission';
import { getRunnerDashboardData } from '@/lib/running/quest.server';

export default async function HealthPage() {
  const dashboard = await getRunnerDashboardData();

  return (
    <PageShell>
      <Navbar />
      <section className="page-container space-y-8">
        <PageHeader
          kicker="Health Performance"
          title="Runner Quest: ลงมือทำวันนี้"
          description="โฟกัสภารกิจวันนี้ให้ชัด แล้วเดินเกมฟิตเนสแบบมีวินัยและโมเมนตัม"
        />
        <RunnerQuestDashboard data={dashboard} />
      </section>
    </PageShell>
  );
}
