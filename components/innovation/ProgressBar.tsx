type ProgressBarProps = {
  current: number;
  total: number;
  activeCount?: number;
  completedCount?: number;
};

export function ProgressBar({ current, total, activeCount, completedCount }: ProgressBarProps) {
  const clampedCurrent = Math.min(current, total);
  const progress = total === 0 ? 0 : (clampedCurrent / total) * 100;

  return (
    <section className="space-y-2 rounded-[22px] border border-slate-200/80 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">แรงส่งรวม</h2>
        <span className="text-sm font-semibold text-slate-900">
          {clampedCurrent} / {total} Innovation
        </span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-950 transition-all duration-500" style={{ width: `${progress}%` }} aria-label="แถบความคืบหน้า Innovation" />
      </div>
      {(activeCount !== undefined || completedCount !== undefined) ? (
        <p className="text-xs font-medium text-slate-500">
          ภารกิจปัจจุบัน {activeCount ?? 0} · สำเร็จแล้ว {completedCount ?? 0}
        </p>
      ) : null}
    </section>
  );
}
