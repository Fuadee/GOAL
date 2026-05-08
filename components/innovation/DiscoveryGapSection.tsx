type DiscoveryGapSectionProps = {
  currentCount: number;
  goalCount: number;
  gap: number;
  candidateCount: number;
  nextAction: string;
};

export function DiscoveryGapSection({ currentCount, goalCount, gap, candidateCount, nextAction }: DiscoveryGapSectionProps) {
  return (
    <section className="space-y-2 rounded-2xl border border-cyan-300/25 bg-cyan-500/5 p-4 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Discovery Gap</p>
      <p className="text-sm text-white">คุณมี {currentCount} / {goalCount} innovations · ยังขาดอีก {gap}</p>
      <p className="text-xs text-slate-300">discovery candidates ปัจจุบัน: {candidateCount}</p>
      <p className="text-xs text-white">Next Action: <span className="font-semibold">→ {nextAction}</span></p>
      <div className="flex flex-wrap gap-2 pt-1">
        <a href="#discovery-candidates" className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20">+ Add Candidate</a>
        <a href="#add-innovation" className="rounded-xl bg-indigo-400/20 px-3 py-2 text-xs font-semibold text-indigo-100 hover:bg-indigo-300/30">+ Add Innovation</a>
      </div>
    </section>
  );
}
