'use client';

import { useState, useTransition } from 'react';

import { markConfidenceStagePassedAction } from '@/app/smv/actions';

type Props = {
  stageKey: string;
  disabled?: boolean;
};

export function ConfidenceStageConfirmButton({ stageKey, disabled = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        disabled={disabled || isPending}
        onClick={() => setIsOpen(true)}
        className="inline-flex rounded-full bg-[#334155] px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[#EEF1EA] disabled:cursor-not-allowed disabled:opacity-60"
      >
        ยืนยันว่าผ่านด่านนี้
      </button>

      {message ? <p className="mt-2 text-xs text-[#334155]">{message}</p> : null}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#DDE3D5] bg-white p-5">
            <h3 className="text-lg font-semibold text-[#1E293B]">ยืนยันการผ่านด่าน</h3>
            <p className="mt-2 text-sm text-[#64748B]">คุณแน่ใจหรือไม่ว่าผ่านด่านนี้จริง</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-[#DDE3D5] px-4 py-2 text-sm text-[#64748B]"
                onClick={() => setIsOpen(false)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isPending}
                className="rounded-full bg-[#334155] px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
                onClick={() => {
                  startTransition(async () => {
                    const data = new FormData();
                    data.set('stage_key', stageKey);
                    const result = await markConfidenceStagePassedAction(data);
                    setMessage(result.message);
                    if (result.success) {
                      setIsOpen(false);
                    }
                  });
                }}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
