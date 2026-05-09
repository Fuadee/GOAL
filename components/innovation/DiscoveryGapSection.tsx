type DiscoveryGapSectionProps = {
  currentCount: number;
  goalCount: number;
  gap: number;
  candidateCount: number;
  nextAction: string;
};

export function DiscoveryGapSection({ currentCount, goalCount, gap, candidateCount, nextAction }: DiscoveryGapSectionProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 shadow-[0_12px_30px_rgba(2,6,23,0.45)] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">🚀 DISCOVERY GAP</p>
      <p className="text-sm text-slate-100 sm:text-base">คุณมี {currentCount} / {goalCount} innovations</p>
      <p className="text-sm text-slate-300 sm:text-base">ยังขาดอีก {gap}</p>
      <p className="text-sm text-slate-300 sm:text-base">discovery candidates ปัจจุบัน: {candidateCount}</p>

      <div className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Next Action</p>
        <p className="mt-1 text-sm font-semibold text-white sm:text-base">→ {nextAction}</p>
      </div>

      <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap sm:gap-3">
        <a href="#discovery-candidates" className="inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-500/25 px-4 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition hover:bg-cyan-500/35">
          + Add Candidate
        </a>
        <a href="#add-innovation" className="inline-flex min-h-11 items-center justify-center rounded-full border border-blue-300/25 bg-blue-500/25 px-4 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition hover:bg-blue-500/35">
          + Add Innovation
        </a>
      </div>
    </section>
  );
}
