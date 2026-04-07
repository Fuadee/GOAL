'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createInnovationLogAction } from '@/app/innovation/[id]/actions';
import { INNOVATION_LOG_TYPES, INNOVATION_STATUS, InnovationRow } from '@/lib/innovation/types';

type AddInnovationLogFormProps = {
  innovation: InnovationRow;
};

export function AddInnovationLogForm({ innovation }: AddInnovationLogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h2 className="text-lg font-semibold text-white">Add execution log</h2>
      <form
        action={(formData) => {
          setError(null);
          setMessage(null);
          startTransition(async () => {
            const result = await createInnovationLogAction(innovation.id, formData);
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
          className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
        />
        <div className="grid gap-3 md:grid-cols-3">
          <select
            name="log_type"
            defaultValue="update"
            className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
          >
            {INNOVATION_LOG_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={innovation.status}
            className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
          >
            {INNOVATION_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            name="progress_percent"
            type="number"
            min={0}
            max={100}
            defaultValue={innovation.progress_percent}
            className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300"
          />
        </div>
        <textarea name="detail" rows={3} placeholder="Detail" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300" />
        <textarea name="problem" rows={2} placeholder="Problem" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300" />
        <textarea name="solution" rows={2} placeholder="Solution" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300" />
        <textarea name="result" rows={2} placeholder="Result" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300" />
        <textarea name="lesson_learned" rows={2} placeholder="Lesson learned" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300" />
        <textarea name="next_step" rows={2} placeholder="Next step" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300" />

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-fit rounded-full bg-indigo-400/20 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-400/30 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save log'}
        </button>
      </form>
    </section>
  );
}
