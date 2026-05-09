'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { markInnovationNextStepDoneAction } from '@/app/innovation/actions';
import { getInnovationMissionSummary } from '@/lib/innovation/helpers';
import { InnovationCardViewModel } from '@/lib/innovation/types';

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
    <section className="space-y-4 rounded-2xl border border-slate-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.35)] md:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-300">CURRENT MISSION</p>
      {!mission ? (
        <div className="space-y-2">
          <p className="text-lg font-semibold text-white">No active mission yet.</p>
          <p className="text-sm text-slate-300">Choose one candidate to start building.</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold leading-tight text-white">{missionSummary.primaryText}</h2>
          <div className="space-y-1.5 text-sm">
            <p className="text-slate-300">NEXT ACTION</p>
            <p className="font-semibold text-white">{missionSummary.secondaryText}</p>
            <p className="text-slate-300">Progress <span className="font-semibold text-white">{mission.progressPercent}%</span></p>
            <p className="text-xs text-slate-400">Updated {formatTimestamp(mission.updated_at)}</p>
          </div>

          {error ? <p className="text-sm text-rose-200">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/innovation/${mission.id}`}
              className="theme-button-primary"
            >
              Continue Mission
            </Link>
            <button
              type="button"
              disabled={isPending || !mission.nextStep}
              onClick={() => {
                if (!mission.nextStep) {
                  return;
                }

                setError(null);
                startTransition(async () => {
                  const result = await markInnovationNextStepDoneAction(mission.id);
                  if (!result.success) {
                    setError(result.message);
                    return;
                  }
                  router.refresh();
                });
              }}
              className="rounded-xl border border-slate-500/60 px-3 py-2 text-sm font-semibold text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Done'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
