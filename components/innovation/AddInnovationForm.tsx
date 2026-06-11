'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createInnovationAction } from '@/app/innovation/actions';

type AddInnovationFormProps = {
  currentCount: number;
  maxCount: number;
};

export function AddInnovationForm({ currentCount, maxCount }: AddInnovationFormProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isLimitReached = currentCount >= maxCount;

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">เพิ่มนวัตกรรม</h2>
        <button
          type="button"
          onClick={() => setIsAdding((prev) => !prev)}
          disabled={isLimitReached}
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + เพิ่มนวัตกรรม
        </button>
      </div>

      {isLimitReached ? <p className="text-sm text-amber-300">คุณเพิ่มนวัตกรรมครบ 10 รายการแล้ว</p> : null}

      {isAdding ? (
        <form
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              const result = await createInnovationAction(formData);
              if (!result.success) {
                setError(result.message);
                return;
              }

              setIsAdding(false);
              router.refresh();
            });
          }}
          className="grid gap-3"
        >
          <input
            type="text"
            name="title"
            placeholder="ชื่อนวัตกรรม"
            className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
            required
          />
          <textarea
            name="description"
            placeholder="รายละเอียดนวัตกรรม"
            rows={3}
            className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
          />
          <textarea
            name="goal"
            placeholder="ผลลัพธ์ที่ต้องการ"
            rows={2}
            className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
          />
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-indigo-400/20 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-400/30 disabled:opacity-50"
            >
              {isPending ? 'กำลังบันทึก...' : 'บันทึกนวัตกรรม'}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/20"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
