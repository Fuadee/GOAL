'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import {
  addCandidateConceptAction,
  convertDiscoveryCandidateAction,
  defineCandidateProblemAction,
  markCandidateValidatedAction,
  updateCandidateConceptAction,
  updateCandidateProblemAction,
  updateCandidateValidationNotesAction
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

function formatTimestamp(value?: string | null): string {
  if (!value) {
    return '-';
  }
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

type Props = { candidate: DiscoveryCandidateRow };

export function DiscoveryCandidateDetailPanel({ candidate }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [problemDraft, setProblemDraft] = useState(candidate.problem ?? '');
  const [conceptDraft, setConceptDraft] = useState(candidate.concept ?? '');
  const [validationDraft, setValidationDraft] = useState(candidate.validation_notes ?? '');

  const stateMeta = useMemo(() => getDiscoveryCandidateStateMeta(candidate), [candidate]);

  const runAction = (runner: () => Promise<{ success: boolean; message: string; innovationId?: string }>, onSuccess?: (result: { innovationId?: string }) => void) => {
    setError(null);
    startTransition(async () => {
      const result = await runner();
      if (!result.success) {
        setError(result.message);
        return;
      }
      onSuccess?.({ innovationId: result.innovationId });
      router.refresh();
    });
  };

  return (
    <section className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Discovery Candidate Detail</p>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATE_STYLES[stateMeta.state]}`}>{stateMeta.label}</span>
        </div>
        <h1 className="text-3xl font-semibold text-white">{candidate.title}</h1>
        <p className="text-sm text-slate-300">Why this state: {stateMeta.description}</p>

        <div className="grid gap-4 rounded-xl border border-white/10 bg-slate-900/40 p-4 md:grid-cols-2">
          <p className="text-sm text-slate-200"><span className="font-semibold text-white">Source:</span> {candidate.source || 'ไม่ระบุแหล่งที่มา'}</p>
          <p className="text-sm text-slate-200"><span className="font-semibold text-white">Impact / Feasibility:</span> {candidate.impact_score} / {candidate.feasibility_score}</p>
          <p className="text-sm text-slate-200"><span className="font-semibold text-white">Created:</span> {formatTimestamp(candidate.created_at)}</p>
          <p className="text-sm text-slate-200"><span className="font-semibold text-white">Updated:</span> {formatTimestamp(candidate.converted_at ?? candidate.validated_at ?? candidate.created_at)}</p>
        </div>

        <div className="space-y-3">
          <article className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Problem</h2>
            <p className="text-slate-100">{candidate.problem || 'ยังไม่ได้ระบุปัญหา'}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Concept</h2>
            <p className="text-slate-100">{candidate.concept || 'ยังไม่มีแนวคิดการแก้'}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Validation Notes</h2>
            <p className="text-slate-100">{candidate.validation_notes || 'ยังไม่มีบันทึกการยืนยันผล'}</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Notes</h2>
            <p className="text-slate-100">{candidate.notes || '-'}</p>
          </article>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-xl font-semibold text-white">Available Actions</h2>
        {error ? <p className="rounded-lg border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</p> : null}

        {stateMeta.allowedActions.includes('define_problem') || stateMeta.allowedActions.includes('edit_problem') ? (
          <div className="space-y-2 rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <textarea rows={3} value={problemDraft} onChange={(event) => setProblemDraft(event.target.value)} className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-sm text-white" />
            <div className="flex gap-2">
              {stateMeta.allowedActions.includes('define_problem') ? (
                <button type="button" disabled={isPending} onClick={() => runAction(() => defineCandidateProblemAction(candidate.id, problemDraft))} className="rounded-full bg-indigo-400/20 px-3 py-2 text-xs font-semibold text-indigo-100 disabled:opacity-50">Define Problem</button>
              ) : null}
              {stateMeta.allowedActions.includes('edit_problem') ? (
                <button type="button" disabled={isPending} onClick={() => runAction(() => updateCandidateProblemAction(candidate.id, problemDraft))} className="rounded-full bg-indigo-400/20 px-3 py-2 text-xs font-semibold text-indigo-100 disabled:opacity-50">Edit Problem</button>
              ) : null}
            </div>
          </div>
        ) : null}

        {(stateMeta.allowedActions.includes('add_concept') || stateMeta.allowedActions.includes('edit_concept')) ? (
          <div className="space-y-2 rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <textarea rows={3} value={conceptDraft} onChange={(event) => setConceptDraft(event.target.value)} className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-sm text-white" />
            {stateMeta.allowedActions.includes('add_concept') ? (
              <button type="button" disabled={isPending} onClick={() => runAction(() => addCandidateConceptAction(candidate.id, conceptDraft))} className="rounded-full bg-violet-400/20 px-3 py-2 text-xs font-semibold text-violet-100 disabled:opacity-50">Add Concept</button>
            ) : null}
            {stateMeta.allowedActions.includes('edit_concept') ? (
              <button type="button" disabled={isPending} onClick={() => runAction(() => updateCandidateConceptAction(candidate.id, conceptDraft))} className="rounded-full bg-violet-400/20 px-3 py-2 text-xs font-semibold text-violet-100 disabled:opacity-50">Edit Concept</button>
            ) : null}
          </div>
        ) : null}

        {stateMeta.allowedActions.includes('mark_validated') || stateMeta.allowedActions.includes('edit_validation_notes') ? (
          <div className="space-y-2 rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <textarea rows={3} value={validationDraft} onChange={(event) => setValidationDraft(event.target.value)} className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2 text-sm text-white" />
            {stateMeta.allowedActions.includes('mark_validated') ? (
              <button type="button" disabled={isPending} onClick={() => runAction(() => markCandidateValidatedAction(candidate.id, validationDraft))} className="rounded-full bg-emerald-400/20 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:opacity-50">Mark Validated</button>
            ) : null}
            {stateMeta.allowedActions.includes('edit_validation_notes') ? (
              <button type="button" disabled={isPending} onClick={() => runAction(() => updateCandidateValidationNotesAction(candidate.id, validationDraft))} className="rounded-full bg-emerald-400/20 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:opacity-50">Edit Validation Notes</button>
            ) : null}
          </div>
        ) : null}

        {stateMeta.allowedActions.includes('edit_basic_info') ? (
          <p className="rounded-xl border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-slate-300">Edit Basic Info: ใช้หน้า <Link className="text-cyan-200 underline" href="/innovation/discovery/new">Add Discovery Candidate</Link> สำหรับสร้างรายการใหม่ หรือแก้ข้อมูลหลักผ่าน API/action ที่เพิ่มภายหลัง</p>
        ) : null}

        {stateMeta.allowedActions.includes('convert_to_innovation') ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => runAction(() => convertDiscoveryCandidateAction(candidate.id), ({ innovationId }) => {
              if (innovationId) {
                router.push(`/innovation/${innovationId}`);
              }
            })}
            className="rounded-full bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-100 disabled:opacity-50"
          >
            Convert to Innovation
          </button>
        ) : null}

        {stateMeta.allowedActions.includes('open_innovation') ? (
          candidate.converted_innovation_id ? (
            <div className="flex flex-wrap gap-2">
              <Link href={`/innovation/${candidate.converted_innovation_id}`} className="rounded-full bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-100">Open Innovation</Link>
              <p className="text-sm text-slate-300">Linked innovation ID: <span className="font-mono text-slate-100">{candidate.converted_innovation_id}</span></p>
            </div>
          ) : (
            <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">Converted แล้ว แต่ไม่พบลิงก์ innovation ที่เชื่อมไว้</p>
          )
        ) : null}

        <div className="pt-2">
          <Link href="/innovation" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20">← Back to Innovation</Link>
        </div>
      </section>
    </section>
  );
}
