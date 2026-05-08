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
    return 'inline-flex rounded-full border border-[#DDE3D5] bg-white/5 px-5 py-2.5 text-sm font-semibold text-[#1E293B] transition hover:border-[#DDE3D5] hover:text-[#334155]';
  }

  if (style === 'inline') {
    return 'inline-flex rounded-full border border-[#DDE3D5]/35 bg-[#334155]/10 px-4 py-2 text-xs font-semibold text-[#334155] transition hover:bg-[#334155]/20';
  }

  return 'inline-flex rounded-full bg-[#334155] px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-[#EEF1EA]';
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
            className="inline-flex rounded-full border border-[#DDE3D5] bg-white/5 px-5 py-2.5 text-sm font-semibold text-[#1E293B] transition hover:border-[#DDE3D5] hover:text-[#334155]"
          >
            บันทึกรายได้เดือนนี้
          </Link>
        ) : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-[#F6F7F4]/80 backdrop-blur-sm"
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
            className="relative z-10 w-full max-w-lg rounded-3xl border border-[#DDE3D5]/40 bg-[#F6F7F4] p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-[#1E293B]">อัปเดตรายได้ปัจจุบัน</h2>
            <p className="mt-1 text-sm text-[#64748B]">อัปเดตแล้ว ระบบจะคำนวณด่านให้อัตโนมัติ</p>

            <label className="mt-5 block">
              <span className="text-sm text-[#64748B]">รายได้ปัจจุบันต่อเดือน (บาท) *</span>
              <input
                name="monthly_income"
                type="number"
                min={0}
                step="0.01"
                required
                className="mt-1 w-full rounded-xl border border-[#DDE3D5] bg-white px-3 py-2 text-sm text-[#1E293B]"
                placeholder="เช่น 45000"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm text-[#64748B]">เดือนที่อ้างอิง (ไม่บังคับ)</span>
              <input
                name="reference_month"
                type="month"
                className="mt-1 w-full rounded-xl border border-[#DDE3D5] bg-white px-3 py-2 text-sm text-[#1E293B]"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm text-[#64748B]">หมายเหตุ (ไม่บังคับ)</span>
              <textarea
                name="note"
                rows={3}
                className="mt-1 w-full rounded-xl border border-[#DDE3D5] bg-white px-3 py-2 text-sm text-[#1E293B]"
                placeholder="บันทึกข้อมูลเพิ่มเติม"
              />
            </label>

            {message ? <p className="mt-3 text-sm text-[#334155]">{message}</p> : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-[#DDE3D5] px-4 py-2 text-sm font-semibold text-[#1E293B]"
                disabled={pending}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-[#334155] px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-70"
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
