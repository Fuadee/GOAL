'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  addCandidateConceptAction,
  convertDiscoveryCandidateAction,
  createDiscoveryCandidateAction,
  defineCandidateProblemAction,
  deleteDiscoveryCandidateAction,
  markCandidateValidatedAction,
  updateCandidateConceptAction,
  updateCandidateProblemAction
} from '@/app/innovation/actions';
import { getDiscoveryCandidateStateMeta } from '@/lib/innovation/helpers';
import { DiscoveryCandidateRow, DiscoveryCandidateState } from '@/lib/innovation/types';

const STATE_STYLES: Record<DiscoveryCandidateState, string> = {
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
  const [draftByCandidate, setDraftByCandidate] = useState<Record<string, { problem?: string; concept?: string; validationNotes?: string }>>({});

  const setDraftField = (candidateId: string, field: 'problem' | 'concept' | 'validationNotes', value: string) => {
    setDraftByCandidate((prev) => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [field]: value
      }
    }));
  };

  const runAction = (runner: () => Promise<{ success: boolean; message: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await runner();
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  };

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
          {candidates.map((candidate) => {
            const stateMeta = getDiscoveryCandidateStateMeta(candidate);
            const draft = draftByCandidate[candidate.id] ?? {};

            return (
              <article key={candidate.id} className="space-y-3 rounded-xl border border-white/10 bg-slate-900/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-white">{candidate.title}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATE_STYLES[stateMeta.state]}`}>{stateMeta.label}</span>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-slate-300">Why this state: {stateMeta.description}</p>
                  <p className="text-slate-300">Source: {candidate.source ?? '-'}</p>
                  {candidate.problem ? <p className="text-slate-200">Problem: {candidate.problem}</p> : null}
                  {candidate.concept ? <p className="text-slate-200">Concept: {candidate.concept}</p> : null}
                  {candidate.validation_notes ? <p className="text-slate-200">Validation: {candidate.validation_notes}</p> : null}
                </div>

                <div className="space-y-2 rounded-lg border border-white/10 bg-slate-950/40 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Available actions</p>

                  {stateMeta.allowedActions.includes('define_problem') || stateMeta.allowedActions.includes('edit_problem') ? (
                    <>
                      <textarea
                        rows={2}
                        placeholder="Problem statement"
                        value={draft.problem ?? candidate.problem ?? ''}
                        onChange={(event) => setDraftField(candidate.id, 'problem', event.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-sm text-white"
                      />
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          runAction(() =>
                            stateMeta.state === 'observed'
                              ? defineCandidateProblemAction(candidate.id, draft.problem ?? candidate.problem ?? '')
                              : updateCandidateProblemAction(candidate.id, draft.problem ?? candidate.problem ?? '')
                          )
                        }
                        className="rounded-full bg-indigo-400/20 px-3 py-2 text-xs font-semibold text-indigo-100 disabled:opacity-50"
                      >
                        {stateMeta.state === 'observed' ? 'Define Problem' : 'Edit Problem'}
                      </button>
                    </>
                  ) : null}

                  {stateMeta.allowedActions.includes('add_concept') || stateMeta.allowedActions.includes('edit_concept') ? (
                    <>
                      <textarea
                        rows={2}
                        placeholder="Solution concept"
                        value={draft.concept ?? candidate.concept ?? ''}
                        onChange={(event) => setDraftField(candidate.id, 'concept', event.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-sm text-white"
                      />
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          runAction(() =>
                            stateMeta.state === 'pain_point'
                              ? addCandidateConceptAction(candidate.id, draft.concept ?? candidate.concept ?? '')
                              : updateCandidateConceptAction(candidate.id, draft.concept ?? candidate.concept ?? '')
                          )
                        }
                        className="rounded-full bg-violet-400/20 px-3 py-2 text-xs font-semibold text-violet-100 disabled:opacity-50"
                      >
                        {stateMeta.state === 'pain_point' ? 'Add Concept' : 'Edit Concept'}
                      </button>
                    </>
                  ) : null}

                  {stateMeta.allowedActions.includes('mark_validated') ? (
                    <>
                      <textarea
                        rows={2}
                        placeholder="Validation notes (optional)"
                        value={draft.validationNotes ?? candidate.validation_notes ?? ''}
                        onChange={(event) => setDraftField(candidate.id, 'validationNotes', event.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-sm text-white"
                      />
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => runAction(() => markCandidateValidatedAction(candidate.id, draft.validationNotes ?? candidate.validation_notes ?? ''))}
                        className="rounded-full bg-emerald-400/20 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:opacity-50"
                      >
                        Mark Validated
                      </button>
                    </>
                  ) : null}

                  {stateMeta.allowedActions.includes('convert_to_innovation') ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => runAction(() => convertDiscoveryCandidateAction(candidate.id))}
                      className="rounded-full bg-cyan-400/20 px-3 py-2 text-xs font-semibold text-cyan-100 disabled:opacity-50"
                    >
                      Convert to Innovation
                    </button>
                  ) : null}

                  {stateMeta.allowedActions.includes('delete_candidate') ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => runAction(() => deleteDiscoveryCandidateAction(candidate.id))}
                      className="rounded-full bg-rose-400/20 px-3 py-2 text-xs font-semibold text-rose-100 disabled:opacity-50"
                    >
                      Delete candidate
                    </button>
                  ) : null}

                  {stateMeta.allowedActions.includes('open_innovation') && candidate.converted_innovation_id ? (
                    <Link href={`/innovation/${candidate.converted_innovation_id}`} className="inline-flex rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20">
                      Open Innovation
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
