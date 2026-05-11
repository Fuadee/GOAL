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
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Discovery Gap</p>
      <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 sm:grid-cols-5">
        <p className="col-span-2 font-semibold text-slate-900 sm:col-span-2">คุณมี {currentCount} / {goalCount} innovations</p>
        <p>ยังขาดอีก {gap}</p>
        <p>{activeMissionCount} Active Mission</p>
        <p>{candidateCount} Candidate Waiting</p>
      </div>
      <Link href="/innovation/discovery/new" className={innovationUi.headerOutlineButton}>+ Add Candidate</Link>
    </section>
  );
}
