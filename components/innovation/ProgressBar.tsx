type ProgressBarProps = {
  current: number;
  total: number;
  activeCount?: number;
  completedCount?: number;
};

export function ProgressBar({ current, total, activeCount, completedCount }: ProgressBarProps) {
  const clampedCurrent = Math.min(current, total);
  const progress = total === 0 ? 0 : (clampedCurrent / total) * 100;
  const isComplete = clampedCurrent >= total;

  return (
    <section className="space-y-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">MOMENTUM</h2>
        <span className="text-sm font-semibold text-slate-900">
          {clampedCurrent} / {total} innovations
        </span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? 'bg-slate-900' : 'bg-slate-900'
          }`}
          style={{ width: `${progress}%` }}
          aria-label="Innovation progress bar"
        />
      </div>
      {(activeCount !== undefined || completedCount !== undefined) ? (
        <p className="text-xs font-medium text-slate-600">
          {activeCount ?? 0} Active · {completedCount ?? 0} Completed
        </p>
      ) : null}
    </section>
  );
}
