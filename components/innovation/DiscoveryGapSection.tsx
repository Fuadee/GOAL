'use client';

type DiscoveryGapSectionProps = {
  currentCount: number;
  goalCount: number;
  gap: number;
  candidateCount: number;
  nextAction: string;
};

export function DiscoveryGapSection({ currentCount, goalCount, gap, candidateCount, nextAction }: DiscoveryGapSectionProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-700/70 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-4 shadow-[0_10px_30px_rgba(2,6,23,0.35)] sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">DISCOVERY GAP</p>
      <p className="text-sm font-medium text-white sm:text-base">คุณมี {currentCount} / {goalCount} innovations</p>
      <p className="text-sm text-slate-200">ยังขาดอีก {gap}</p>
      <p className="text-sm text-slate-200">Candidate พร้อมประเมิน: {candidateCount}</p>

      <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-3">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Next Action</p>
        <p className="mt-1 text-sm font-semibold text-white">→ {nextAction}</p>
      </div>

      <a href="#discovery-candidates" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white">
        + Add Candidate
      </a>
    </section>
  );
}
