import { ReactNode } from 'react';

type ConstructionActionItem = {
  label: string;
  value: string;
};

type Props = {
  statusLabel: string;
  progressPercent: number;
  actionItems: ConstructionActionItem[];
  children?: ReactNode;
};

function ProgressRing({ progressPercent }: { progressPercent: number }) {
  const clamped = Math.max(0, Math.min(progressPercent, 100));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" className="text-slate-700" fill="none" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          className="text-[#334155] drop-shadow-sm"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-[#1E293B]">{clamped}%</div>
    </div>
  );
}

export function ConstructionHeroCard({
  statusLabel,
  progressPercent,
  actionItems,
  children
}: Props) {
  return (
    <section className="rounded-3xl border border-[#DDE3D5]/20 bg-white p-5 shadow-sm shadow-sm md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#64748B]/70">MAIN FINANCIAL PROJECT</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#1E293B] md:text-4xl">Construction – Baan Na Teen</h2>
          <p className="mt-3 text-sm text-[#64748B] md:text-base">12-unit rental house plan driving the path to 100K/month</p>

          {actionItems.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {actionItems.map((item) => (
                <article key={item.label} className="rounded-xl border border-[#DDE3D5] bg-[#F6F7F4]/60 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-[#94A3B8]">{item.label}</p>
                  <p className="mt-1 text-base font-semibold text-[#1E293B]">{item.value}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#DDE3D5]/40 bg-[#EEF1EA]/10 px-3 py-1 text-xs font-semibold text-[#334155]">
🏗 {statusLabel}
          </span>
          <ProgressRing progressPercent={progressPercent} />
        </div>
      </div>

      {children ? <div className="mt-6 space-y-4">{children}</div> : null}
    </section>
  );
}
