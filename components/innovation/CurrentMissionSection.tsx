'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { markInnovationNextStepDoneAction, terminateInnovationMissionAction } from '@/app/innovation/actions';
import { getInnovationMissionSummary } from '@/lib/innovation/helpers';
import { InnovationCardViewModel } from '@/lib/innovation/types';

const dateFormatter = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

type CurrentMissionSectionProps = {
  mission: InnovationCardViewModel | null;
};

function formatTimestamp(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function CurrentMissionSection({ mission }: CurrentMissionSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isTerminating, startTerminateTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const missionSummary = getInnovationMissionSummary(mission);

  return (
    <>
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.36)] sm:p-6 md:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-slate-200/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-6 h-48 w-48 rounded-full bg-cyan-100/60 blur-3xl" />
        <div className="relative space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">ภารกิจปัจจุบัน</p>
              <h2 className="text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">{!mission ? 'ยังไม่มีภารกิจปัจจุบัน' : missionSummary.primaryText}</h2>
              {!mission ? (
                <p className="text-sm leading-6 text-slate-500">เลือกไอเดียหนึ่งรายการเพื่อเริ่มลงมือทำ</p>
              ) : (
                <div className="space-y-1 text-sm leading-6 text-slate-600">
                  <p className="font-semibold text-slate-900">ขั้นตอนถัดไป</p>
                  <p>{missionSummary.secondaryText}</p>
                  <p className="text-xs text-slate-500">อัปเดตล่าสุด {formatTimestamp(mission.updated_at)}</p>
                </div>
              )}
            </div>
            {mission ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center shadow-sm sm:min-w-32">
                <p className="text-3xl font-semibold tracking-tight text-slate-950">{mission.progressPercent}%</p>
                <p className="text-xs font-medium text-slate-500">ความคืบหน้า</p>
              </div>
            ) : null}
          </div>

          {mission ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>ความคืบหน้า</span>
                  <span>{mission.completedStepCount}/{mission.stepTotal} ขั้นตอน</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 p-[2px]">
                  <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${Math.max(0, Math.min(100, mission.progressPercent))}%` }} />
                </div>
              </div>
              {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
              <div className="grid gap-2 sm:grid-cols-3">
                <Link href={`/innovation/${mission.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-slate-800 hover:shadow-md">ทำภารกิจต่อ</Link>
                <button type="button" disabled={isPending || !mission.nextStep} onClick={() => {
                  if (!mission.nextStep) return;
                  setError(null);
                  startTransition(async () => {
                    const result = await markInnovationNextStepDoneAction(mission.id);
                    if (!result.success) {
                      setError(result.message);
                      return;
                    }
                    router.refresh();
                  });
                }} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:bg-slate-50 disabled:opacity-50">{isPending ? 'กำลังบันทึก...' : 'ขั้นตอนนี้เสร็จแล้ว'}</button>
                <button
                  type="button"
                  disabled={isPending || isTerminating}
                  onClick={() => {
                    setError(null);
                    setIsConfirmOpen(true);
                  }}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:-translate-y-px hover:bg-rose-100 disabled:opacity-50"
                >
                  ยุติภารกิจ
                </button>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {mission && isConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="terminate-mission-title">
          <button
            type="button"
            aria-label="ปิดหน้าต่างยืนยัน"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setIsConfirmOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_30px_90px_-35px_rgba(15,23,42,0.55)] sm:p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">ยืนยันการเปลี่ยนสถานะ</p>
                <h3 id="terminate-mission-title" className="text-2xl font-semibold text-slate-950">ยุติภารกิจนี้หรือไม่?</h3>
                <p className="text-sm leading-6 text-slate-600">ภารกิจนี้จะถูกย้ายไปยังประวัติ พร้อมสถานะยุติแล้วไม่สำเร็จ</p>
              </div>
              {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={isTerminating}
                  onClick={() => setIsConfirmOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={isTerminating}
                  onClick={() => {
                    startTerminateTransition(async () => {
                      const result = await terminateInnovationMissionAction(mission.id);
                      if (!result.success) {
                        setError(result.message);
                        return;
                      }
                      setIsConfirmOpen(false);
                      router.refresh();
                    });
                  }}
                  className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {isTerminating ? 'กำลังยุติ...' : 'ยืนยันยุติภารกิจ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
