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
    <section className="space-y-4 hero-panel space-y-4 border-amber-300/30">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">🔥 Current Mission</p>
      {!mission ? (
        <p className="text-sm text-slate-200">{missionSummary.primaryText}</p>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-white">{missionSummary.primaryText}</h2>
          <div className="space-y-2 text-sm text-slate-100">
            <p>Next Step: <span className="font-semibold text-white">{missionSummary.secondaryText}</span></p>
            <p>Progress: <span className="font-semibold text-white">{mission.progressPercent}%</span></p>
            <p>Last updated: <span className="font-semibold text-white">{formatTimestamp(mission.updated_at)}</span></p>
          </div>

          {error ? <p className="text-sm text-rose-200">{error}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/innovation/${mission.id}`}
              className="theme-button-secondary"
            >
              Open details
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
              className="theme-button-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Mark Next Step Done'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
