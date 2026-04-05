import { HealthLevelCard } from './HealthLevelCard';

const TOTAL_LEVELS = 5;
const currentLevel = 1;

const levels = Array.from({ length: TOTAL_LEVELS }, (_, index) => {
  const level = index + 1;

  let status: 'locked' | 'unlocked' | 'completed' = 'locked';

  if (level < currentLevel) {
    status = 'completed';
  } else if (level <= currentLevel) {
    status = 'unlocked';
  }

  return {
    level,
    distanceKm: level,
    status
  };
});

const progressPercent = (currentLevel / TOTAL_LEVELS) * 100;

export function HealthLevelsSection() {
  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-[0_0_30px_rgba(15,23,42,0.4)] md:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">🧠 Health Levels (ด่านการวิ่ง)</h2>
        <p className="text-sm text-slate-300">Build momentum with clear milestones from 1 to 5 km.</p>
      </div>

      <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-slate-300">Level {currentLevel} / {TOTAL_LEVELS}</span>
          <span className="text-sky-300">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {levels.map((item) => (
          <HealthLevelCard key={item.level} level={item.level} distanceKm={item.distanceKm} status={item.status} />
        ))}
      </div>
    </section>
  );
}
