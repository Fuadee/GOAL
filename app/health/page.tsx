import { Navbar } from '@/components/navbar';
import { RunnerQuestDashboard } from '@/components/health/RunnerQuestDashboard';
import { getRunnerDashboardData } from '@/lib/running/quest.server';

export default async function HealthPage() {
  const dashboard = await getRunnerDashboardData();

  return (
    <main className="app-shell">
      <Navbar />

      <section className="page-container space-y-8">
        <header className="page-header">
          <p className="page-kicker">Mission Control</p>
          <h1 className="page-title">Runner Quest: ลงมือทำวันนี้</h1>
          <p className="text-base text-[color:var(--text-secondary)]">อย่าดู progress อย่างเดียว ให้ลงมือจริง แล้วค่อยกลับมาดูรายงาน.</p>
        </header>

        <RunnerQuestDashboard data={dashboard} />
      </section>
    </main>
  );
}
