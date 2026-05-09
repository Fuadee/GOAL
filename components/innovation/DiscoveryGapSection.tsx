'use client';

type DiscoveryGapSectionProps = {
  currentCount: number;
  goalCount: number;
  gap: number;
  candidateCount: number;
  nextAction: {
    label: string;
    source: 'current_step' | 'next_step' | 'next_milestone' | 'candidate_queue' | 'discovery_mode';
    ctaLabel: 'Continue Mission' | 'Review Candidate' | '+ Add Candidate';
    href: string;
  };
};

export function DiscoveryGapSection({ currentCount, goalCount, gap, candidateCount, nextAction }: DiscoveryGapSectionProps) {
  const sourceLabelMap: Record<DiscoveryGapSectionProps['nextAction']['source'], string> = {
    current_step: 'From current step',
    next_step: 'From next step',
    next_milestone: 'From next milestone',
    candidate_queue: 'From candidate queue',
    discovery_mode: 'Discovery mode'
  };

  return (
    <section className="space-y-3 rounded-2xl border border-slate-700/70 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-4 shadow-[0_10px_30px_rgba(2,6,23,0.35)] sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">DISCOVERY GAP</p>
      <p className="text-sm font-medium text-white sm:text-base">คุณมี {currentCount} / {goalCount} innovations</p>
      <p className="text-sm text-slate-200">ยังขาดอีก {gap}</p>
      <p className="text-sm text-slate-200">Candidate พร้อมประเมิน: {candidateCount}</p>

      <div className="rounded-xl border border-slate-600/80 bg-slate-950/80 px-3.5 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">NEXT ACTION</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">→ {nextAction.label}</p>
        <p className="mt-1 text-xs text-slate-400">{sourceLabelMap[nextAction.source]}</p>
      </div>

      <a href={nextAction.href} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white">
        {nextAction.ctaLabel}
      </a>
    </section>
  );
}
