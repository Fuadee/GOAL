'use client';
import Link from 'next/link';
import { innovationUi } from './uiTokens';

type DiscoveryGapSectionProps = {
  currentCount: number;
  goalCount: number;
  gap: number;
  candidateCount: number;
  activeMissionCount: number;
};

export function DiscoveryGapSection({ currentCount, goalCount, gap, candidateCount, activeMissionCount }: DiscoveryGapSectionProps) {

  return (
    <section className="space-y-3 rounded-2xl border border-cyan-900/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-4 shadow-[0_10px_35px_rgba(8,47,73,0.3)] sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">DISCOVERY GAP</p>
      <p className="text-sm font-semibold text-white sm:text-base">คุณมี {currentCount} / {goalCount} innovations</p>
      <p className="text-sm text-slate-100">ยังขาดอีก {gap}</p>
      <p className="text-sm text-slate-100">{activeMissionCount} Active Mission</p>
      <p className="text-sm text-slate-100">{candidateCount} Candidate Waiting</p>
      <Link href="/innovation/discovery/new" className={innovationUi.secondaryButton}>+ Add Candidate</Link>
    </section>
  );
}
