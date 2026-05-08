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
    <section className="rounded-2xl border border-amber-300/35 bg-amber-500/10 p-4 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200">🔥 Current Mission</p>
      {!mission ? (
        <p className="text-sm text-slate-200">{missionSummary.primaryText}</p>
      ) : (
        <>
          <p className="flex-1 text-sm font-semibold text-white md:text-base">{missionSummary.primaryText}</p>
          <p className="text-xs text-slate-300">Next: <span className="font-medium text-white">{missionSummary.secondaryText}</span></p>
          <p className="text-xs text-slate-300">Progress: <span className="font-medium text-white">{mission.progressPercent}%</span></p>
          <p className="text-xs text-slate-300">Updated: <span className="font-medium text-white">{formatTimestamp(mission.updated_at)}</span></p>

          {error ? <p className="text-sm text-rose-200">{error}</p> : null}

          <div className="ml-auto flex flex-wrap gap-2">
            <Link
              href={`/innovation/${mission.id}`}
              className="theme-button-secondary px-3 py-2 text-xs"
            >
              Continue
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
              className="theme-button-primary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Move Stage'}
            </button>
          </div>
        </>
      )}
      </div>
    </section>
  );
}
