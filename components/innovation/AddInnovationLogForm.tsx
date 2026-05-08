'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createInnovationLogAction } from '@/app/innovation/[id]/actions';
import { INNOVATION_LOG_TYPES } from '@/lib/innovation/types';

type AddInnovationLogFormProps = {
  innovationId: string;
};

export function AddInnovationLogForm({ innovationId }: AddInnovationLogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="space-y-4 rounded-2xl border border-[#DDE3D5] bg-white/5 p-6 backdrop-blur">
      <h2 className="text-lg font-semibold text-[#1E293B]">Add execution log</h2>
      <form
        action={(formData) => {
          setError(null);
          setMessage(null);
          startTransition(async () => {
            const result = await createInnovationLogAction(innovationId, formData);
            if (!result.success) {
              setError(result.message);
              return;
            }
            setMessage(result.message);
            router.refresh();
          });
        }}
        className="grid gap-3"
      >
        <input
          name="title"
          type="text"
          required
          placeholder="What happened?"
          className="rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#DDE3D5]"
        />
        <select
          name="log_type"
          defaultValue="update"
          className="rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#DDE3D5]"
        >
          {INNOVATION_LOG_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <textarea name="detail" rows={3} placeholder="Detail" className="rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#DDE3D5]" />
        <textarea name="problem" rows={2} placeholder="Problem" className="rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#DDE3D5]" />
        <textarea name="solution" rows={2} placeholder="Solution" className="rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#DDE3D5]" />
        <textarea name="result" rows={2} placeholder="Result" className="rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#DDE3D5]" />
        <textarea name="lesson_learned" rows={2} placeholder="Lesson learned" className="rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#DDE3D5]" />
        <textarea name="next_step" rows={2} placeholder="Next step" className="rounded-xl border border-[#DDE3D5] bg-white/70 px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#DDE3D5]" />

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-fit rounded-full bg-[#EEF1EA]/20 px-4 py-2 text-sm font-semibold text-[#334155] transition hover:bg-[#EEF1EA]/30 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save log'}
        </button>
      </form>
    </section>
  );
}
