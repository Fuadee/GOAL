'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { markInnovationNextStepDoneAction } from '@/app/innovation/actions';
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
  const [error, setError] = useState<string | null>(null);
  const missionSummary = getInnovationMissionSummary(mission);

  return (
    <MissionHeroCard accent="cyan" kicker="CURRENT MISSION" title={!mission ? 'No active mission yet.' : missionSummary.primaryText}>
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
          </MissionActionBar>
        </>
      )}
    </MissionHeroCard>
  );
}
