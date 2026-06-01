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
  observed: 'border border-slate-200 bg-slate-100 text-slate-700',
  pain_point: 'border border-rose-200 bg-rose-50 text-rose-700',
  concept: 'border border-indigo-200 bg-indigo-50 text-indigo-700',
  validated: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  converted: 'border border-cyan-200 bg-cyan-50 text-cyan-800'
};

function formatTimestamp(value?: string | null): string {
  if (!value) {
    return '-';
  }
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
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
      <section className="space-y-4 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.28)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">รายละเอียดไอเดีย</p>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATE_STYLES[stateMeta.state]}`}>{stateMeta.label}</span>
        </div>
        <h1 className="text-3xl font-semibold text-slate-950">{candidate.title}</h1>
        <p className="text-sm text-slate-500">เหตุผลของสถานะ: {stateMeta.description}</p>

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:grid-cols-2">
          <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">แหล่งที่มา:</span> {candidate.source || 'ไม่ระบุแหล่งที่มา'}</p>
          <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">ผลกระทบ / ความเป็นไปได้:</span> {candidate.impact_score} / {candidate.feasibility_score}</p>
          <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">สร้างเมื่อ:</span> {formatTimestamp(candidate.created_at)}</p>
          <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">อัปเดตล่าสุด:</span> {formatTimestamp(candidate.converted_at ?? candidate.validated_at ?? candidate.created_at)}</p>
        </div>

        <div className="space-y-3">
          <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">ปัญหา</h2>
            <p className="text-slate-700">{candidate.problem || 'ยังไม่ได้ระบุปัญหา'}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">แนวคิด</h2>
            <p className="text-slate-700">{candidate.concept || 'ยังไม่มีแนวคิดการแก้'}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">บันทึกการยืนยันผล</h2>
            <p className="text-slate-700">{candidate.validation_notes || 'ยังไม่มีบันทึกการยืนยันผล'}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">บันทึกเพิ่มเติม</h2>
            <p className="text-slate-700">{candidate.notes || '-'}</p>
          </article>
        </div>
      </section>

      <section className="space-y-3 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.28)] sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">การดำเนินการ</h2>
        {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        {stateMeta.allowedActions.includes('define_problem') || stateMeta.allowedActions.includes('edit_problem') ? (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <textarea rows={3} value={problemDraft} onChange={(event) => setProblemDraft(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400" />
            <div className="flex gap-2">
              {stateMeta.allowedActions.includes('define_problem') ? (
                <button type="button" disabled={isPending} onClick={() => runAction(() => defineCandidateProblemAction(candidate.id, problemDraft))} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-50">ระบุปัญหา</button>
              ) : null}
              {stateMeta.allowedActions.includes('edit_problem') ? (
                <button type="button" disabled={isPending} onClick={() => runAction(() => updateCandidateProblemAction(candidate.id, problemDraft))} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-50">แก้ไขปัญหา</button>
              ) : null}
            </div>
          </div>
        ) : null}

        {(stateMeta.allowedActions.includes('add_concept') || stateMeta.allowedActions.includes('edit_concept')) ? (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <textarea rows={3} value={conceptDraft} onChange={(event) => setConceptDraft(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400" />
            {stateMeta.allowedActions.includes('add_concept') ? (
              <button type="button" disabled={isPending} onClick={() => runAction(() => addCandidateConceptAction(candidate.id, conceptDraft))} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-50">เพิ่มแนวคิด</button>
            ) : null}
            {stateMeta.allowedActions.includes('edit_concept') ? (
              <button type="button" disabled={isPending} onClick={() => runAction(() => updateCandidateConceptAction(candidate.id, conceptDraft))} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-50">แก้ไขแนวคิด</button>
            ) : null}
          </div>
        ) : null}

        {stateMeta.allowedActions.includes('mark_validated') || stateMeta.allowedActions.includes('edit_validation_notes') ? (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <textarea rows={3} value={validationDraft} onChange={(event) => setValidationDraft(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400" />
            {stateMeta.allowedActions.includes('mark_validated') ? (
              <button type="button" disabled={isPending} onClick={() => runAction(() => markCandidateValidatedAction(candidate.id, validationDraft))} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50">ยืนยันผลแล้ว</button>
            ) : null}
            {stateMeta.allowedActions.includes('edit_validation_notes') ? (
              <button type="button" disabled={isPending} onClick={() => runAction(() => updateCandidateValidationNotesAction(candidate.id, validationDraft))} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50">แก้ไขบันทึกยืนยันผล</button>
            ) : null}
          </div>
        ) : null}

        {stateMeta.allowedActions.includes('edit_basic_info') ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">ข้อมูลหลัก: ใช้หน้า <Link className="text-slate-900 underline" href="/innovation/discovery/new">เพิ่มไอเดีย</Link> สำหรับสร้างรายการใหม่ หรือแก้ข้อมูลหลักผ่าน API/action ที่เพิ่มภายหลัง</p>
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
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          >
            เริ่มเป็นภารกิจ Innovation
          </button>
        ) : null}

        {stateMeta.allowedActions.includes('open_innovation') ? (
          candidate.converted_innovation_id ? (
            <div className="flex flex-wrap gap-2">
              <Link href={`/innovation/${candidate.converted_innovation_id}`} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm">เปิดภารกิจ Innovation</Link>
              <p className="text-sm text-slate-500">รหัสภารกิจที่เชื่อมไว้: <span className="font-mono text-slate-700">{candidate.converted_innovation_id}</span></p>
            </div>
          ) : (
            <p className="rounded-xl border border-amber-400/40 bg-amber-50 px-3 py-2 text-sm text-amber-700">Converted แล้ว แต่ไม่พบลิงก์ innovation ที่เชื่อมไว้</p>
          )
        ) : null}

        <div className="pt-2">
          <Link href="/innovation" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">← กลับหน้า Innovation</Link>
        </div>
      </section>
    </section>
  );
}
