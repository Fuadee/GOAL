import Link from 'next/link';
import { GoalModuleSummary } from '@/lib/dashboard/types';

type GoalModuleGridProps = {
  modules: GoalModuleSummary[];
};

const accentStyles: Record<GoalModuleSummary['key'], string> = {
  smv: 'from-violet-400/30 to-fuchsia-500/10',
  money: 'from-green-400/30 to-emerald-500/10',
  health: 'from-cyan-400/30 to-blue-500/10',
  innovation: 'from-amber-400/30 to-orange-500/10',
  world: 'from-indigo-400/30 to-cyan-500/10'
};

export function GoalModuleGrid({ modules }: GoalModuleGridProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="mission-label">MODULE CONTROL</p>
        <h2 className="section-title">MISSION SYSTEMS</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <article key={module.key} className={`mission-card bg-gradient-to-br ${accentStyles[module.key]} p-[1px]`}>
            <div className="relative z-10 h-full rounded-2xl bg-slate-950/80 p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="card-title">{module.name}</h3>
                <p className="text-xl font-bold text-cyan-200">{module.currentScore}%</p>
              </div>
              <p className="body-text mt-2">{module.interpretation}</p>

              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="caption-text">Main Metric</dt>
                  <dd className="text-slate-100">{module.mainMetricLabel}: {module.mainMetricValue}</dd>
                </div>
                <div>
                  <dt className="caption-text">Next Action</dt>
                  <dd className="font-semibold text-cyan-200">{module.nextAction}</dd>
                </div>
              </dl>

              <Link href={module.route} className="theme-button-secondary mt-5 inline-flex">
                ENTER {module.shortLabel}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
