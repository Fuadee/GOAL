'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { convertDiscoveryCandidateAction, createDiscoveryCandidateAction } from '@/app/innovation/actions';
import { DiscoveryCandidateRow, DiscoveryCandidateStatus } from '@/lib/innovation/types';

const STATUS_LABELS: Record<DiscoveryCandidateStatus, string> = {
  observed: 'observed',
  pain_point: 'pain_point',
  concept: 'concept',
  validated: 'validated',
  converted: 'converted'
};

const STATUS_STYLES: Record<DiscoveryCandidateStatus, string> = {
  observed: 'bg-slate-500/20 text-slate-200',
  pain_point: 'bg-rose-500/20 text-rose-200',
  concept: 'bg-indigo-500/20 text-indigo-200',
  validated: 'bg-emerald-500/20 text-emerald-200',
  converted: 'bg-cyan-500/20 text-cyan-200'
};

type DiscoveryCandidatesSectionProps = {
  candidates: DiscoveryCandidateRow[];
};

export function DiscoveryCandidatesSection({ candidates }: DiscoveryCandidatesSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <section id="discovery-candidates" className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h2 className="text-xl font-semibold text-white">🧠 Discovery Candidates</h2>

      <form
        className="grid gap-3 rounded-xl border border-white/10 bg-slate-900/40 p-4"
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = await createDiscoveryCandidateAction(formData);
            if (!result.success) {
              setError(result.message);
              return;
            }
            router.refresh();
          });
        }}
      >
        <input name="title" required placeholder="Candidate title" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white" />
        <textarea name="problem" rows={2} placeholder="Problem" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white" />
        <input name="source" placeholder="Source" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white" />
        <div className="grid gap-3 md:grid-cols-2">
          <input name="impact_score" type="number" placeholder="Impact score" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white" />
          <input name="feasibility_score" type="number" placeholder="Feasibility score" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white" />
        </div>
        <textarea name="notes" rows={2} placeholder="Notes" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white" />
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button type="submit" disabled={isPending} className="w-fit rounded-full bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-100 disabled:opacity-50">
          {isPending ? 'Saving...' : '+ Add Candidate'}
        </button>
      </form>

      {candidates.length === 0 ? (
        <p className="text-slate-300">No discovery candidates yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {candidates.map((candidate) => (
            <article key={candidate.id} className="space-y-3 rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-white">{candidate.title}</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[candidate.status]}`}>
                  {STATUS_LABELS[candidate.status]}
                </span>
              </div>
              <p className="text-sm text-slate-300">Source: {candidate.source ?? '-'}</p>
              {candidate.problem ? <p className="text-sm text-slate-200">{candidate.problem}</p> : null}
              {candidate.impact_score ? <p className="text-sm text-slate-200">Impact score: {candidate.impact_score}</p> : null}
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    await convertDiscoveryCandidateAction(candidate.id);
                    router.refresh();
                  });
                }}
                className="rounded-full bg-indigo-400/20 px-3 py-2 text-xs font-semibold text-indigo-100 disabled:opacity-50"
              >
                Promote to innovation
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
