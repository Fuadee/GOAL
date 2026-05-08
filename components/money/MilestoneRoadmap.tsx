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
    <section className="space-y-5 rounded-3xl border border-[#DDE3D5] bg-white/[0.03] p-6 backdrop-blur md:p-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-[#94A3B8]">Milestone Roadmap</p>
        <h2 className="text-2xl font-semibold text-[#1E293B]">Debt → Asset → Rent → Stable Cash Flow</h2>
      </div>

      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const progress = Math.max(0, Math.min(100, (milestone.current / milestone.target) * 100));
          const isDone = milestone.current >= milestone.target;

          return (
            <div key={milestone.label} className="rounded-2xl border border-[#DDE3D5] bg-white/55 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                      isDone
                        ? 'border-emerald-300/50 bg-emerald-300/20 text-emerald-200'
                        : 'border-[#DDE3D5] bg-white/5 text-[#64748B]'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <p className="font-medium text-[#1E293B]">{milestone.label}</p>
                </div>
                <p className="text-sm text-[#64748B]">
                  {milestone.current} / {milestone.target} {milestone.metricLabel}
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEF1EA]">
                <div
                  className={`h-full rounded-full ${
                    isDone ? 'bg-white' : 'bg-white'
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
