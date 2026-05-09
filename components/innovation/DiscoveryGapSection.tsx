'use client';
import { innovationUi } from './uiTokens';

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
    <section className="space-y-3 rounded-2xl border border-cyan-900/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-4 shadow-[0_10px_35px_rgba(8,47,73,0.3)] sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">DISCOVERY GAP</p>
      <p className="text-sm font-semibold text-white sm:text-base">คุณมี {currentCount} / {goalCount} innovations</p>
      <p className="text-sm text-slate-100">ยังขาดอีก {gap}</p>
      <p className="text-sm text-slate-100">Candidate พร้อมประเมิน: {candidateCount}</p>

      <div className="rounded-xl border border-cyan-900/40 bg-slate-950 px-3.5 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">NEXT ACTION</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">→ {nextAction.label}</p>
        <p className="mt-1 text-xs text-slate-300">{sourceLabelMap[nextAction.source]}</p>
      </div>

      <a href={nextAction.href} className={innovationUi.secondaryButton}>
        {nextAction.ctaLabel}
      </a>
    </section>
  );
}
