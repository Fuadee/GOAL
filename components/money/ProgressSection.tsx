import { ReactNode } from 'react';

type ProgressSectionProps = {
  title: string;
  valueLabel: string;
  percent: number;
  helperText?: string;
  rightContent?: ReactNode;
};

export function ProgressSection({ title, valueLabel, percent, helperText, rightContent }: ProgressSectionProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <p className="mt-1 text-lg font-semibold text-white">{valueLabel}</p>
          {helperText ? <p className="text-sm text-slate-300">{helperText}</p> : null}
        </div>
        {rightContent}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
