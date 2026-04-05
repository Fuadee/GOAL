type MilestoneRoadmapProps = {
  completedHouses: number;
  rentedHouses: number;
};

export function MilestoneRoadmap({ completedHouses, rentedHouses }: MilestoneRoadmapProps) {
  const milestones = [
    { target: 1, label: 'House 01 completed', current: completedHouses, metricLabel: 'completed houses' },
    { target: 3, label: '3 houses fully rented', current: rentedHouses, metricLabel: 'rented houses' },
    { target: 6, label: 'Cash flow momentum established', current: rentedHouses, metricLabel: 'rented houses' },
    { target: 12, label: '12-house mission achieved', current: completedHouses, metricLabel: 'completed houses' }
  ];

  return (
    <section className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur md:p-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Milestone Roadmap</p>
        <h2 className="text-2xl font-semibold text-white">Debt → Asset → Rent → Stable Cash Flow</h2>
      </div>

      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const progress = Math.max(0, Math.min(100, (milestone.current / milestone.target) * 100));
          const isDone = milestone.current >= milestone.target;

          return (
            <div key={milestone.label} className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                      isDone
                        ? 'border-emerald-300/50 bg-emerald-300/20 text-emerald-200'
                        : 'border-white/20 bg-white/5 text-slate-300'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <p className="font-medium text-white">{milestone.label}</p>
                </div>
                <p className="text-sm text-slate-300">
                  {milestone.current} / {milestone.target} {milestone.metricLabel}
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${
                    isDone ? 'bg-gradient-to-r from-emerald-400 to-lime-300' : 'bg-gradient-to-r from-indigo-500 to-sky-400'
                  }`}
                  style={{ width: `${progress}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
