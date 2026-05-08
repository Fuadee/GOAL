type LevelStatus = 'locked' | 'unlocked' | 'completed';

type HealthLevelCardProps = {
  level: number;
  distanceKm: number;
  status: LevelStatus;
};

const statusStyles: Record<LevelStatus, string> = {
  completed:
    'border-emerald-400/60 bg-emerald-500/10 shadow-sm hover:border-emerald-300/80',
  unlocked:
    'border-sky-400/60 bg-sky-500/10 shadow-sm hover:border-sky-300/80',
  locked:
    'border-slate-700/60 bg-white/70 opacity-70 shadow-sm hover:opacity-80'
};

const statusTextStyles: Record<LevelStatus, string> = {
  completed: 'text-emerald-300',
  unlocked: 'text-sky-300',
  locked: 'text-[#94A3B8]'
};

const statusLabel: Record<LevelStatus, string> = {
  completed: 'Completed',
  unlocked: 'Unlocked',
  locked: 'Locked'
};

export function HealthLevelCard({ level, distanceKm, status }: HealthLevelCardProps) {
  return (
    <article
      className={`group rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 ${statusStyles[status]}`}
      aria-label={`Level ${level} ${statusLabel[status]}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">Level {level}</p>
        <span className={`text-sm font-medium ${statusTextStyles[status]}`}>
          {status === 'completed' ? '✓ ' : ''}
          {statusLabel[status]}
        </span>
      </div>

      <p className="text-3xl font-semibold text-[#1E293B]">{distanceKm} km</p>
      <p className="mt-2 text-sm text-[#64748B]">Run and clear this stage to unlock your next challenge.</p>
    </article>
  );
}
