'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createInnovationAction } from '@/app/innovation/actions';

type DiscoveryGapSectionProps = {
  currentCount: number;
  goalCount: number;
  gap: number;
  candidateCount: number;
  nextAction: string;
};

export function DiscoveryGapSection({ currentCount, goalCount, gap, candidateCount, nextAction }: DiscoveryGapSectionProps) {
  const router = useRouter();
  const [isInnovationModalOpen, setIsInnovationModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isLimitReached = currentCount >= goalCount;

  return (
    <>
      <section className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 shadow-[0_12px_30px_rgba(2,6,23,0.45)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">🚀 DISCOVERY GAP</p>
        <p className="text-sm text-slate-100 sm:text-base">คุณมี {currentCount} / {goalCount} innovations</p>
        <p className="text-sm text-slate-300 sm:text-base">ยังขาดอีก {gap}</p>
        <p className="text-sm text-slate-300 sm:text-base">discovery candidates ปัจจุบัน: {candidateCount}</p>

        <div className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Next Action</p>
          <p className="mt-1 text-sm font-semibold text-white sm:text-base">→ {nextAction}</p>
        </div>

        <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap sm:gap-3">
          <a href="#discovery-candidates" className="inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-500/25 px-4 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition hover:bg-cyan-500/35">
            + Add Candidate
          </a>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsInnovationModalOpen(true);
            }}
            disabled={isLimitReached}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-blue-300/25 bg-blue-500/25 px-4 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition hover:bg-blue-500/35 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add Innovation
          </button>
        </div>
      </section>

      {isInnovationModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-3 sm:items-center sm:p-6">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Add Innovation</h3>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
                onClick={() => setIsInnovationModalOpen(false)}
              >
                Close
              </button>
            </div>

            {isLimitReached ? <p className="text-sm text-amber-300">You reached the {goalCount} innovation limit.</p> : null}

            <form
              action={(formData) => {
                setError(null);
                startTransition(async () => {
                  const result = await createInnovationAction(formData);
                  if (!result.success) {
                    setError(result.message);
                    return;
                  }
                  setIsInnovationModalOpen(false);
                  router.refresh();
                });
              }}
              className="grid gap-3"
            >
              <input
                type="text"
                name="title"
                placeholder="Innovation title"
                className="rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
                required
              />
              <textarea
                name="description"
                placeholder="Innovation description"
                rows={3}
                className="rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
              />
              <textarea
                name="goal"
                placeholder="Outcome goal"
                rows={2}
                className="rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
              />
              {error ? <p className="text-sm text-rose-300">{error}</p> : null}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isPending || isLimitReached}
                  className="rounded-full bg-indigo-400/20 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-400/30 disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Innovation'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsInnovationModalOpen(false)}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
