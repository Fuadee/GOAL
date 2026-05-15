import { ConstructionProgressSection } from '@/components/money-planner/ConstructionProgressSection';
import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';
import { getConstructionProgressData } from '@/lib/money/service';

export default async function MoneyManagementPage() {
  const construction = await getConstructionProgressData();

  return (
    <PageShell>
      <Navbar />
      <section className="page-container space-y-5 pt-2 md:pt-3">
        <ConstructionProgressSection steps={construction.steps} />

        <article className="theme-card border border-indigo-300/20 bg-indigo-500/5 p-5">
          <h2 className="section-title text-indigo-100">Money System Reset</h2>
          <p className="helper-text mt-2 text-indigo-100/80">
            ระบบรายได้/รายจ่ายถูกพักไว้ก่อน เพื่อให้หน้านี้กลับมาใช้งานได้เสถียร เราจะออกแบบใหม่ให้เรียบง่ายกว่าเดิม
          </p>
          <button
            type="button"
            disabled
            className="mt-4 rounded-full border border-indigo-300/30 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-100/70 opacity-80"
          >
            Plan new money system
          </button>
        </article>
      </section>
    </PageShell>
  );
}
