import { ConstructionProgressSection } from '@/components/money-planner/ConstructionProgressSection';
import { IncomePlanningSystem } from '@/components/money-planner/IncomePlanningSystem';
import { Navbar } from '@/components/navbar';
import { PageHeader, PageShell } from '@/components/ui/mission';
import { getConstructionProgressData, getMoneyDashboardData } from '@/lib/money/service';

export default async function MoneyManagementPage() {
  const [data, construction] = await Promise.all([getMoneyDashboardData(), getConstructionProgressData()]);

  return (
    <PageShell>
      <Navbar />
      <section className="page-container space-y-8">
        <PageHeader
          kicker="Money Management"
          title="Executive Capital Control"
          description="จัดการรายรับ รายจ่าย และ mission การเงินที่สำคัญในมุมมองเดียวแบบชัดเจน"
        />
        <ConstructionProgressSection steps={construction.steps} />
        <IncomePlanningSystem data={data} />
      </section>
    </PageShell>
  );
}
