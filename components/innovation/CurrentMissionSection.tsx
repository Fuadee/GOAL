'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { markInnovationNextStepDoneAction, terminateInnovationMissionAction } from '@/app/innovation/actions';
import { getInnovationMissionSummary } from '@/lib/innovation/helpers';
import { InnovationCardViewModel } from '@/lib/innovation/types';
import { MissionActionBar, MissionHeroCard, MissionProgressSection } from '@/components/ui/mission-system';

type CurrentMissionSectionProps = {
  mission: InnovationCardViewModel | null;
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function CurrentMissionSection({ mission }: CurrentMissionSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isTerminating, startTerminateTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const missionSummary = getInnovationMissionSummary(mission);

  return (
    <>
      <MissionHeroCard accent="cyan" kicker="CURRENT MISSION" title={!mission ? 'ยังไม่มี Active Mission' : missionSummary.primaryText}>
        {!mission ? (
          <p className="mt-2 text-sm text-cyan-100/80">Choose one candidate to start building.</p>
        ) : (
          <>
            <div className="mt-3 space-y-1 text-sm text-cyan-100/80">
              <p>NEXT ACTION</p>
              <p className="font-semibold text-white">{missionSummary.secondaryText}</p>
              <p className="text-xs text-cyan-200/70">Updated {formatTimestamp(mission.updated_at)}</p>
            </div>
            <MissionProgressSection accent="cyan" value={mission.progressPercent} label={`Progress ${mission.progressPercent}%`} />
            {error ? <p className="text-sm text-rose-200">{error}</p> : null}
            <MissionActionBar>
              <Link href={`/innovation/${mission.id}`} className="w-full rounded-xl border border-cyan-100/35 bg-gradient-to-r from-cyan-200 via-sky-200 to-blue-100 px-4 py-3 text-center text-sm font-semibold text-[#082132] shadow-[0_12px_24px_-14px_rgba(103,232,249,0.85)]">Continue Mission</Link>
              <button type="button" disabled={isPending || !mission.nextStep} onClick={() => {
                if (!mission.nextStep) return;
                setError(null);
                startTransition(async () => {
                  const result = await markInnovationNextStepDoneAction(mission.id);
                  if (!result.success) {
                    setError(result.message);
                    return;
                  }
                  router.refresh();
                });
              }} className="w-full rounded-xl border border-white/20 bg-slate-900/40 px-3 py-2 text-sm font-semibold text-slate-100 disabled:opacity-50">{isPending ? 'Saving...' : 'Mark Next Step Done'}</button>
              <button
                type="button"
                disabled={isPending || isTerminating}
                onClick={() => {
                  setError(null);
                  setIsConfirmOpen(true);
                }}
                className="w-full rounded-xl border border-rose-200/20 bg-rose-950/20 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-200/35 hover:bg-rose-900/30 disabled:opacity-50"
              >
                ยุติภารกิจ / Move to History
              </button>
            </MissionActionBar>
          </>
        )}
      </MissionHeroCard>

      {mission && isConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="terminate-mission-title">
          <button
            type="button"
            aria-label="Close confirmation"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setIsConfirmOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-200/20 bg-gradient-to-br from-[#1a1117] via-[#111827] to-[#070b12] p-5 shadow-[0_30px_90px_-35px_rgba(244,63,94,0.75)] sm:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.16),transparent_52%)]" />
            <div className="relative space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-100/70">Confirmation</p>
                <h3 id="terminate-mission-title" className="text-2xl font-semibold text-white">ยุติภารกิจนี้หรือไม่?</h3>
                <p className="text-sm leading-6 text-slate-200/80">ภารกิจนี้จะถูกย้ายไปยังประวัติ พร้อมสถานะยุติแล้วไม่สำเร็จ</p>
              </div>
              {error ? <p className="rounded-2xl border border-rose-300/25 bg-rose-950/30 px-3 py-2 text-sm text-rose-100">{error}</p> : null}
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={isTerminating}
                  onClick={() => setIsConfirmOpen(false)}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isTerminating}
                  onClick={() => {
                    setError(null);
                    startTerminateTransition(async () => {
                      const result = await terminateInnovationMissionAction(mission.id);
                      if (!result.success) {
                        setError(result.message);
                        return;
                      }
                      setIsConfirmOpen(false);
                      router.refresh();
                    });
                  }}
                  className="rounded-xl border border-rose-200/35 bg-rose-500/15 px-4 py-3 text-sm font-semibold text-rose-50 transition hover:bg-rose-500/25 disabled:opacity-50"
                >
                  {isTerminating ? 'Terminating...' : 'ยืนยันยุติภารกิจ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
