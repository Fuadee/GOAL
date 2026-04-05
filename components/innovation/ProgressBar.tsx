type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const clampedCurrent = Math.min(current, total);
  const progress = total === 0 ? 0 : (clampedCurrent / total) * 100;
  const isComplete = clampedCurrent >= total;

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Innovation Progress</h2>
        <span className="text-sm font-medium text-slate-300">
          {clampedCurrent} / {total} innovations
        </span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800/80">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? 'bg-emerald-400' : 'bg-indigo-400'
          }`}
          style={{ width: `${progress}%` }}
          aria-label="Innovation progress bar"
        />
      </div>
    </section>
  );
}
