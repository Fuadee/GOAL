import Link from 'next/link';
import { GoalModuleSummary } from '@/lib/dashboard/types';

type GoalModuleGridProps = {
  modules: GoalModuleSummary[];
};

const accentStyles: Record<GoalModuleSummary['key'], string> = {
  smv: 'from-violet-400/20 to-fuchsia-500/10',
  money: 'from-emerald-400/20 to-teal-500/10',
  health: 'from-cyan-400/20 to-sky-500/10',
  innovation: 'from-amber-400/20 to-orange-500/10',
  world: 'from-indigo-400/20 to-blue-500/10'
};

export function GoalModuleGrid({ modules }: GoalModuleGridProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Goal Modules</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <article
            key={module.key}
            className={`rounded-3xl border border-white/10 bg-gradient-to-br ${accentStyles[module.key]} p-[1px] shadow-lg shadow-slate-950/20`}
          >
            <div className="h-full rounded-3xl bg-slate-900/90 p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">{module.name}</h3>
                <p className="text-xl font-semibold text-white">{module.currentScore}%</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">{module.interpretation}</p>

              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="text-slate-400">Main Metric</dt>
                  <dd className="text-slate-100">{module.mainMetricLabel}: {module.mainMetricValue}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Next Action</dt>
                  <dd className="text-cyan-200">{module.nextAction}</dd>
                </div>
              </dl>

              <Link
                href={module.route}
                className="mt-5 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/50 hover:bg-white/10"
              >
                เข้าโมดูล {module.shortLabel}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
