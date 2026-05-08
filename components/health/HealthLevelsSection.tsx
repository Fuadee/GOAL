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
    <section className="space-y-6 rounded-2xl border border-[#DDE3D5] bg-white/40 p-6 shadow-sm md:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#1E293B]">🧠 Health Levels (ด่านการวิ่ง)</h2>
        <p className="text-sm text-[#64748B]">Build momentum with clear milestones from 1 to 5 km.</p>
      </div>

      <div className="space-y-3 rounded-xl border border-[#DDE3D5] bg-[#F6F7F4]/70 p-4">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-[#64748B]">Level {currentLevel} / {TOTAL_LEVELS}</span>
          <span className="text-sky-300">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#EEF1EA]">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
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
