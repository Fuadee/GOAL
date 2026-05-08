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
    <div className="space-y-3 rounded-2xl border border-[#DDE3D5] bg-[#F6F7F4]/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">{title}</p>
          <p className="mt-1 text-lg font-semibold text-[#1E293B]">{valueLabel}</p>
          {helperText ? <p className="text-sm text-[#64748B]">{helperText}</p> : null}
        </div>
        {rightContent}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#EEF1EA]">
        <div
          className="h-full rounded-full bg-white transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
