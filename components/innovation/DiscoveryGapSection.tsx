type DiscoveryGapSectionProps = {
  currentCount: number;
  goalCount: number;
  gap: number;
  candidateCount: number;
  nextAction: string;
};

export function DiscoveryGapSection({ currentCount, goalCount, gap, candidateCount, nextAction }: DiscoveryGapSectionProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-[#DDE3D5]/30 bg-[#EEF1EA]/10 p-6 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#64748B]">🚀 Discovery Gap</p>
      <p className="text-[#1E293B]">คุณมี {currentCount} / {goalCount} innovations</p>
      <p className="text-[#64748B]">ยังขาดอีก {gap}</p>
      <p className="text-[#64748B]">discovery candidates ปัจจุบัน: {candidateCount}</p>
      <p className="text-sm text-[#1E293B]">Next Action: <span className="font-semibold">→ {nextAction}</span></p>
      <div className="flex flex-wrap gap-3">
        <a href="#discovery-candidates" className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-[#1E293B] hover:bg-white/20">+ Add Candidate</a>
        <a href="#add-innovation" className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-[#1E293B] hover:bg-white/20">+ Add Innovation</a>
      </div>
    </section>
  );
}
