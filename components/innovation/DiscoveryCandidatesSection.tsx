"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';

import { getDiscoveryCandidateStateMeta } from '@/lib/innovation/helpers';
import { DiscoveryCandidateRow, DiscoveryCandidateState } from '@/lib/innovation/types';
import { innovationUi, statusBadge } from './uiTokens';
import { convertDiscoveryCandidateAction, createDiscoveryCandidateAction, deleteDiscoveryCandidateAction } from '@/app/innovation/actions';

const STATE_STYLES: Record<DiscoveryCandidateState, string> = {
  observed: `${statusBadge.base} ${statusBadge.neutral}`,
  pain_point: `${statusBadge.base} border border-rose-200 bg-rose-50 text-rose-700`,
  concept: `${statusBadge.base} ${statusBadge.concept}`,
  validated: `${statusBadge.base} border border-cyan-200 bg-cyan-50 text-cyan-800`,
  converted: `${statusBadge.base} ${statusBadge.building}`
};

type DiscoveryCandidatesSectionProps = {
  candidates: DiscoveryCandidateRow[];
};

function getProblemPreview(candidate: DiscoveryCandidateRow): string {
  if (candidate.problem?.trim()) {
    return candidate.problem.trim();
  }

  return candidate.notes?.trim() || 'ยังไม่ได้ระบุปัญหา';
}

export function DiscoveryCandidatesSection({ candidates }: DiscoveryCandidatesSectionProps) {
  const router = useRouter();
  const sectionRef = useRef<HTMLDetailsElement>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isCreatingCandidate, setIsCreatingCandidate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<DiscoveryCandidateRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCreateCandidate = (formData: FormData) => {
    setCreateError(null);
    startTransition(async () => {
      const result = await createDiscoveryCandidateAction(formData);
      if (!result.success) {
        setCreateError(result.message);
        return;
      }

      setIsCreatingCandidate(false);
      router.refresh();
    });
  };

  const handleDeleteCandidate = () => {
    if (!candidateToDelete) {
      return;
    }

    setDeleteError(null);
    setPendingId(candidateToDelete.id);
    startTransition(async () => {
      let result: { success: boolean; message: string };

      try {
        result = await deleteDiscoveryCandidateAction(candidateToDelete.id);
      } catch {
        result = { success: false, message: 'ไม่สามารถลบไอเดียได้ กรุณาลองใหม่อีกครั้ง' };
      }

      if (!result.success) {
        setDeleteError(result.message);
        setPendingId(null);
        return;
      }

      setCandidateToDelete(null);
      setPendingId(null);
      router.refresh();
    });
  };

  return (
    <details ref={sectionRef} id="discovery-candidates" className="rounded-[24px] border border-slate-200/80 bg-white/80 p-4 shadow-sm" open={false}>
      <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={innovationUi.sectionTitle}>ไอเดียรอคัดเลือก ({candidates.length})</h2>
          <p className={innovationUi.sectionSubtitle}>ไอเดียที่รอเลือกเข้าสู่การลงมือทำ</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <span className="px-1 text-center text-sm font-semibold text-slate-600">เปิดดู</span>
          <button
            type="button"
            className={`${innovationUi.secondaryButton} w-full sm:w-auto`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setCreateError(null);
              setIsCreatingCandidate(true);
              if (sectionRef.current) {
                sectionRef.current.open = true;
              }
            }}
          >
            + เพิ่มไอเดีย
          </button>
        </div>
      </summary>

      {isCreatingCandidate ? (
        <div className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
          <h3 className="text-sm font-semibold text-slate-900">สร้างไอเดียรอคัดเลือก</h3>
          <form className="mt-3 grid gap-3" action={handleCreateCandidate}>
            <input type="text" name="title" required placeholder="ชื่อไอเดีย" className={innovationUi.input} />
            <textarea name="problem" rows={3} placeholder="ปัญหาหรือ pain point" className={innovationUi.input} />

            {createError ? <p className="text-sm text-rose-600">{createError}</p> : null}

            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={isPending} className={innovationUi.primaryButton}>{isPending ? 'กำลังบันทึก...' : 'บันทึกไอเดีย'}</button>
              <button type="button" onClick={() => setIsCreatingCandidate(false)} className={innovationUi.secondaryButton}>ยกเลิก</button>
            </div>
          </form>
        </div>
      ) : null}

      {candidates.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-slate-700">
          <p className="font-medium">ยังไม่มีไอเดียในคิว</p>
          <p className="text-sm text-slate-500">เพิ่มไอเดียหนึ่งรายการ แล้วค่อยเลือกเริ่มภารกิจ</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {candidates.map((candidate) => {
            const stateMeta = getDiscoveryCandidateStateMeta(candidate);
            const problemPreview = getProblemPreview(candidate);

            return (
              <article key={candidate.id} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-1 text-base font-semibold text-slate-900">{candidate.title}</h3>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATE_STYLES[stateMeta.state]}`}>{stateMeta.label}</span>
                    <button
                      type="button"
                      disabled={isPending}
                      aria-label={`ลบไอเดีย ${candidate.title}`}
                      title="ลบไอเดีย"
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setDeleteError(null);
                        setCandidateToDelete(candidate);
                      }}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <p className="line-clamp-2 text-sm text-slate-700">{problemPreview}</p>
                <p className="line-clamp-1 text-xs text-slate-500">{stateMeta.description}</p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isPending}
                    className={innovationUi.primaryButton}
                    onClick={(event) => {
                      event.stopPropagation();
                      setPendingId(candidate.id);
                      startTransition(async () => {
                        const result = await convertDiscoveryCandidateAction(candidate.id);
                        if (result.success && result.innovationId) {
                          router.push(`/innovation/${result.innovationId}`);
                        }
                        router.refresh();
                        setPendingId(null);
                      });
                    }}
                  >
                    {isPending && pendingId === candidate.id ? 'กำลังเริ่ม...' : 'เริ่มภารกิจ'}
                  </button>
                  <Link
                    href={`/innovation/discovery/${candidate.id}`}
                    className={innovationUi.secondaryButton}
                    onClick={(event) => event.stopPropagation()}
                  >
                    เปิดดู
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {candidateToDelete ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-candidate-title"
          aria-describedby="delete-candidate-description"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isPending) {
              setCandidateToDelete(null);
              setDeleteError(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-[24px] border border-white/60 bg-white p-5 shadow-2xl sm:p-6">
            <h3 id="delete-candidate-title" className="text-lg font-semibold text-slate-950">ลบไอเดียนี้?</h3>
            <p id="delete-candidate-description" className="mt-2 text-sm leading-6 text-slate-600">
              <span className="font-semibold text-slate-900">“{candidateToDelete.title}”</span> จะถูกลบออกจากรายการไอเดียรอคัดเลือก
            </p>
            {candidateToDelete.converted_innovation_id ? (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-800">
                ภารกิจ Innovation ที่สร้างจากไอเดียนี้จะไม่ถูกลบ แต่การเชื่อมโยงกลับมายังไอเดียจะถูกยกเลิก
              </p>
            ) : null}
            {deleteError ? <p className="mt-3 text-sm text-rose-600" role="alert">{deleteError}</p> : null}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isPending}
                className={innovationUi.secondaryButton}
                onClick={() => {
                  setCandidateToDelete(null);
                  setDeleteError(null);
                }}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isPending}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleDeleteCandidate}
              >
                {isPending ? 'กำลังลบ...' : 'ลบไอเดีย'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </details>
  );
}
