'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { markInnovationNextStepDoneAction } from '@/app/innovation/actions';
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

  return (
    <section className="space-y-4 rounded-2xl border border-amber-300/40 bg-amber-500/10 p-6 shadow-[0_0_30px_rgba(251,191,36,0.15)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">🔥 Current Mission</p>
      {!mission ? (
        <p className="text-sm text-slate-200">No active mission right now. Add an innovation to start execution.</p>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-white">{mission.title}</h2>
          <div className="space-y-2 text-sm text-slate-100">
            <p>Next Step: <span className="font-semibold text-white">{mission.nextStep?.title ?? 'No pending step'}</span></p>
            <p>Progress: <span className="font-semibold text-white">{mission.progressPercent}%</span></p>
            <p>Last updated: <span className="font-semibold text-white">{formatTimestamp(mission.updated_at)}</span></p>
          </div>

          {error ? <p className="text-sm text-rose-200">{error}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/innovation/${mission.id}`}
              className="rounded-full bg-indigo-400/30 px-4 py-2 text-xs font-semibold text-indigo-100 transition hover:bg-indigo-400/40"
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
              className="rounded-full bg-emerald-400/30 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Mark Next Step Done'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
