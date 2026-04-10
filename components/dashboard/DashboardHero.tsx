import { LifeDirectionSummary } from '@/lib/dashboard/types';

type DashboardHeroProps = {
  lifeDirection: LifeDirectionSummary;
  activeGoals: number;
  urgentAlerts: number;
};

const kpiClass =
  'rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-[0_12px_35px_-20px_rgba(15,23,42,0.9)]';

export function DashboardHero({ lifeDirection, activeGoals, urgentAlerts }: DashboardHeroProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Executive Dashboard</p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">Life Command Center</h1>
          <p className="max-w-xl text-sm text-slate-300 md:text-base">
            ภาพรวมเป้าหมายทั้งหมด เพื่อดูว่าชีวิตกำลังไปในทิศทางที่ต้องการหรือไม่
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className={kpiClass}>
            <p className="text-xs uppercase tracking-wide text-slate-400">Overall Direction</p>
            <p className="mt-2 text-2xl font-semibold text-white">{lifeDirection.score}%</p>
          </div>
          <div className={kpiClass}>
            <p className="text-xs uppercase tracking-wide text-slate-400">Active Goals</p>
            <p className="mt-2 text-2xl font-semibold text-white">{activeGoals}</p>
          </div>
          <div className={kpiClass}>
            <p className="text-xs uppercase tracking-wide text-slate-400">Urgent Alerts</p>
            <p className="mt-2 text-2xl font-semibold text-rose-300">{urgentAlerts}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
