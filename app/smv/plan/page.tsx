import { Navbar } from '@/components/navbar';
import { getSmvPlanData } from '@/lib/smv/service';

export default async function SmvPlanPage() {
  const data = await getSmvPlanData();

  return (
    <main className="app-shell">
      <Navbar />
      <section className="page-container space-y-5">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">แผนพัฒนา</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">/smv/plan</h1>
          <p className="mt-2 text-sm text-slate-300">งานถูกสร้างจากช่องว่างหลักฐานและเงื่อนไขคะแนนปัจจุบัน</p>
        </header>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">งานพัฒนาที่แนะนำ</h2>
          <div className="mt-3 space-y-3">
            {data.tasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
                <p className="font-medium text-white">{task.title}</p>
                <p className="text-xs text-slate-400">{data.dimensionLabelById[task.dimension_id] ?? 'ไม่ทราบมิติ'}</p>
                {task.description ? <p className="mt-1 text-sm text-slate-300">{task.description}</p> : null}
              </div>
            ))}
            {data.tasks.length === 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
                {data.fallbackRecommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </article>
      </section>
    </main>
  );
}
