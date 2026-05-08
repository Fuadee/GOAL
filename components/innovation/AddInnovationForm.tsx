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
    <section className="space-y-4 rounded-2xl border border-[#DDE3D5] bg-white/5 p-6 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#1E293B]">Add Innovation</h2>
        <button
          type="button"
          onClick={() => setIsAdding((prev) => !prev)}
          disabled={isLimitReached}
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-[#1E293B] transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add Innovation
        </button>
      </div>

      {isLimitReached ? <p className="text-sm text-amber-300">You reached the 10 innovation limit.</p> : null}

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
            placeholder="Innovation title"
            className="rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#DDE3D5]"
            required
          />
          <textarea
            name="description"
            placeholder="Innovation description"
            rows={3}
            className="rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#DDE3D5]"
          />
          <textarea
            name="goal"
            placeholder="Outcome goal"
            rows={2}
            className="rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#DDE3D5]"
          />
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[#EEF1EA]/20 px-4 py-2 text-sm font-semibold text-[#334155] transition hover:bg-[#EEF1EA]/30 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Innovation'}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-[#64748B] transition hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
