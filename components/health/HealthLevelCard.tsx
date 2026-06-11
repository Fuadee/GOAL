type LevelStatus = 'locked' | 'unlocked' | 'completed';

type HealthLevelCardProps = {
  level: number;
  distanceKm: number;
  status: LevelStatus;
};

const statusStyles: Record<LevelStatus, string> = {
  completed:
    'border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_28px_rgba(52,211,153,0.15)] hover:border-emerald-300/80',
  unlocked:
    'border-sky-400/60 bg-sky-500/10 shadow-[0_0_28px_rgba(56,189,248,0.15)] hover:border-sky-300/80',
  locked:
    'border-slate-200 bg-white shadow-sm hover:border-slate-300'
};

const statusTextStyles: Record<LevelStatus, string> = {
  completed: 'text-emerald-600',
  unlocked: 'text-blue-600',
  locked: 'text-[color:var(--text-muted)]'
};

const statusLabel: Record<LevelStatus, string> = {
  completed: 'ปลดล็อกแล้ว',
  unlocked: 'พร้อมทำ',
  locked: 'ยังล็อกอยู่'
};

export function HealthLevelCard({ level, distanceKm, status }: HealthLevelCardProps) {
  return (
    <article
      className={`group rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 ${statusStyles[status]}`}
      aria-label={`Level ${level} ${statusLabel[status]}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold tracking-[0.01em] text-[color:var(--text-secondary)]">เลเวล {level}</p>
        <span className={`text-sm font-medium ${statusTextStyles[status]}`}>
          {status === 'completed' ? '✓ ' : ''}
          {statusLabel[status]}
        </span>
      </div>

      <p className="text-3xl font-semibold text-[color:var(--text-primary)]">{distanceKm} km</p>
      <p className="mt-2 text-sm text-[color:var(--text-secondary)]">วิ่งให้ผ่านด่านนี้เพื่อปลดล็อกความท้าทายถัดไป</p>
    </article>
  );
}
