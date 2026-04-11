'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { saveStatusIncomeAction } from '@/app/smv/actions';

type StatusIncomeActionsProps = {
  triggerLabel?: string;
  triggerStyle?: 'primary' | 'secondary' | 'inline';
  showSecondaryLink?: boolean;
  compact?: boolean;
};

function triggerClass(style: StatusIncomeActionsProps['triggerStyle']) {
  if (style === 'secondary') {
    return 'inline-flex rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-200 hover:text-cyan-100';
  }

  if (style === 'inline') {
    return 'inline-flex rounded-full border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20';
  }

  return 'inline-flex rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200';
}

export function StatusIncomeActions({
  triggerLabel = 'อัปเดตรายได้ปัจจุบัน',
  triggerStyle = 'primary',
  showSecondaryLink = false,
  compact = false
}: StatusIncomeActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  return (
    <>
      <div className={`flex flex-wrap gap-3 ${compact ? '' : 'mt-5'}`}>
        <button type="button" onClick={() => setOpen(true)} className={triggerClass(triggerStyle)}>
          {triggerLabel}
        </button>

        {showSecondaryLink ? (
          <Link
            href="/smv/log?dimension=status"
            className="inline-flex rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-200 hover:text-cyan-100"
          >
            บันทึกรายได้เดือนนี้
          </Link>
        ) : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            aria-label="Close modal"
            onClick={() => setOpen(false)}
            disabled={pending}
          />

          <form
            action={(formData) => {
              setMessage('');
              startTransition(async () => {
                const result = await saveStatusIncomeAction(formData);
                setMessage(result.message);
                if (result.success) {
                  router.refresh();
                  setOpen(false);
                }
              });
            }}
            className="relative z-10 w-full max-w-lg rounded-3xl border border-cyan-300/40 bg-slate-950 p-6 shadow-[0_0_40px_rgba(34,211,238,0.25)]"
          >
            <h2 className="text-xl font-semibold text-white">อัปเดตรายได้ปัจจุบัน</h2>
            <p className="mt-1 text-sm text-slate-300">อัปเดตแล้ว ระบบจะคำนวณด่านให้อัตโนมัติ</p>

            <label className="mt-5 block">
              <span className="text-sm text-slate-200">รายได้ปัจจุบันต่อเดือน (บาท) *</span>
              <input
                name="monthly_income"
                type="number"
                min={0}
                step="0.01"
                required
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white"
                placeholder="เช่น 45000"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm text-slate-200">เดือนที่อ้างอิง (ไม่บังคับ)</span>
              <input
                name="reference_month"
                type="month"
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm text-slate-200">หมายเหตุ (ไม่บังคับ)</span>
              <textarea
                name="note"
                rows={3}
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white"
                placeholder="บันทึกข้อมูลเพิ่มเติม"
              />
            </label>

            {message ? <p className="mt-3 text-sm text-cyan-100">{message}</p> : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white"
                disabled={pending}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-70"
              >
                {pending ? 'กำลังบันทึก...' : 'บันทึกรายได้'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
