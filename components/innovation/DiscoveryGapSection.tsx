'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createDiscoveryCandidateAction, createInnovationAction } from '@/app/innovation/actions';
import { innovationUi } from './uiTokens';

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
    <section className="space-y-4 rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.32)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">ภาพรวมไอเดีย</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">เป้าหมาย Innovation {currentCount} / {goalCount}</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 sm:grid-cols-4">
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"><span className="block text-xs text-slate-500">ยังขาด</span><span className="font-semibold text-slate-950">{gap}</span></p>
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"><span className="block text-xs text-slate-500">ภารกิจปัจจุบัน</span><span className="font-semibold text-slate-950">{activeMissionCount}</span></p>
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"><span className="block text-xs text-slate-500">ไอเดียรอคัดเลือก</span><span className="font-semibold text-slate-950">{candidateCount}</span></p>
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"><span className="block text-xs text-slate-500">ทั้งหมด</span><span className="font-semibold text-slate-950">{currentCount}</span></p>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">บันทึกไอเดียก่อนหายไป แล้วคัดเลือกไอเดียที่ดีที่สุดเข้าสู่การลงมือทำ</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:items-center">
          <button type="button" onClick={() => setMode('innovation')} className={innovationUi.primaryButton}>+ เพิ่ม Innovation</button>
          <button type="button" onClick={() => setMode('candidate')} className={innovationUi.secondaryButton}>+ เพิ่มไอเดีย</button>
        </div>
      </div>

      {mode ? (
        <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
          <h3 className="text-sm font-semibold text-slate-900">{mode === 'candidate' ? 'สร้างไอเดียรอคัดเลือก' : 'สร้างภารกิจ Innovation'}</h3>
          <form className="mt-3 grid gap-3" action={mode === 'candidate' ? handleCreateCandidate : handleCreateInnovation}>
            <input type="text" name="title" required placeholder={mode === 'candidate' ? 'ชื่อไอเดีย' : 'ชื่อภารกิจ Innovation'} className={innovationUi.input} />

            {mode === 'candidate' ? (
              <textarea name="problem" rows={3} placeholder="ปัญหาหรือ pain point" className={innovationUi.input} />
            ) : (
              <>
                <textarea name="description" rows={3} placeholder="รายละเอียดภารกิจ" className={innovationUi.input} />
                <textarea name="goal" rows={2} placeholder="เป้าหมายผลลัพธ์" className={innovationUi.input} />
              </>
            )}

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={isPending} className={innovationUi.primaryButton}>{isPending ? 'กำลังบันทึก...' : mode === 'candidate' ? 'บันทึกไอเดีย' : 'บันทึกภารกิจ'}</button>
              <button type="button" onClick={() => setMode(null)} className={innovationUi.secondaryButton}>ยกเลิก</button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
