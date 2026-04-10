type DiscoveryGapSectionProps = {
  currentCount: number;
  goalCount: number;
  gap: number;
  candidateCount: number;
  nextAction: string;
};

export function DiscoveryGapSection({ currentCount, goalCount, gap, candidateCount, nextAction }: DiscoveryGapSectionProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-cyan-300/30 bg-cyan-500/10 p-6 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">🚀 Discovery Gap</p>
      <p className="text-white">คุณมี {currentCount} / {goalCount} innovations</p>
      <p className="text-slate-200">ยังขาดอีก {gap}</p>
      <p className="text-slate-200">discovery candidates ปัจจุบัน: {candidateCount}</p>
      <p className="text-sm text-white">Next Action: <span className="font-semibold">→ {nextAction}</span></p>
      <div className="flex flex-wrap gap-3">
        <a href="#discovery-candidates" className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20">+ Add Candidate</a>
        <a href="#add-innovation" className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20">+ Add Innovation</a>
      </div>
    </section>
  );
}
