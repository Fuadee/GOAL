'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createDiscoveryCandidateAction, createInnovationAction } from '@/app/innovation/actions';

type DiscoveryGapSectionProps = {
  currentCount: number;
  goalCount: number;
  gap: number;
  candidateCount: number;
  activeMissionCount: number;
};

type CreateMode = 'candidate' | 'innovation' | null;

export function DiscoveryGapSection({ currentCount, goalCount, gap, candidateCount, activeMissionCount }: DiscoveryGapSectionProps) {
  const router = useRouter();
  const [mode, setMode] = useState<CreateMode>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreateCandidate = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createDiscoveryCandidateAction(formData);
      if (!result.success) {
        setError(result.message);
        return;
      }

      setMode(null);
      router.refresh();
    });
  };

  const handleCreateInnovation = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createInnovationAction(formData);
      if (!result.success) {
        setError(result.message);
        return;
      }

      setMode(null);
      router.refresh();
    });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Discovery Gap</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 sm:grid-cols-5">
            <p className="col-span-2 font-semibold text-slate-900 sm:col-span-2">คุณมี {currentCount} / {goalCount} innovations</p>
            <p>ยังขาดอีก {gap}</p>
            <p>{activeMissionCount} Active Mission</p>
            <p>{candidateCount} Candidate Waiting</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-600">Capture ideas before they disappear, then promote the best one into active execution.</p>
            <p className="text-xs text-slate-500">Candidate = idea stage · Innovation = execution stage</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setMode('innovation')}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-[180ms] ease-in-out hover:-translate-y-px hover:bg-slate-800 hover:shadow-lg"
          >
            + Add Innovation
          </button>
          <button
            type="button"
            onClick={() => setMode('candidate')}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition duration-[180ms] ease-in-out hover:-translate-y-px hover:shadow"
          >
            + Add Candidate
          </button>
        </div>
      </div>

      {mode ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">{mode === 'candidate' ? 'Create Candidate Idea' : 'Create Innovation Mission'}</h3>
          <form className="mt-3 grid gap-3" action={mode === 'candidate' ? handleCreateCandidate : handleCreateInnovation}>
            <input
              type="text"
              name="title"
              required
              placeholder={mode === 'candidate' ? 'Candidate title' : 'Innovation mission title'}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            />

            {mode === 'candidate' ? (
              <textarea
                name="problem"
                rows={3}
                placeholder="Problem / pain point"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500"
              />
            ) : (
              <>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Mission description"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                />
                <textarea
                  name="goal"
                  rows={2}
                  placeholder="Outcome goal"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                />
              </>
            )}

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition duration-[180ms] ease-in-out hover:-translate-y-px hover:bg-slate-800 hover:shadow-md disabled:opacity-50"
              >
                {isPending ? 'Saving...' : mode === 'candidate' ? 'Save Candidate' : 'Save Innovation'}
              </button>
              <button
                type="button"
                onClick={() => setMode(null)}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition duration-[180ms] ease-in-out hover:-translate-y-px hover:shadow"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
