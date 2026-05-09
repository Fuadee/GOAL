'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createInnovationLogAction } from '@/app/innovation/[id]/actions';
import { INNOVATION_LOG_TYPES } from '@/lib/innovation/types';

type AddInnovationLogFormProps = { innovationId: string };

export function AddInnovationLogForm({ innovationId }: AddInnovationLogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <details className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
      <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">+ Add Log</summary>
      <form
        action={(formData) => {
          setError(null);
          setMessage(null);
          startTransition(async () => {
            const result = await createInnovationLogAction(innovationId, formData);
            if (!result.success) return setError(result.message);
            setMessage(result.message);
            router.refresh();
          });
        }}
        className="mt-3 grid gap-3"
      >
        <input name="title" type="text" required placeholder="What happened?" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300" />
        <select name="log_type" defaultValue="update" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300">
          {INNOVATION_LOG_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <textarea name="detail" rows={3} placeholder="Detail" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-300" />
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        <button type="submit" disabled={isPending} className="w-fit rounded-full bg-indigo-400/20 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-400/30 disabled:opacity-50">{isPending ? 'Saving...' : 'Save log'}</button>
      </form>
    </details>
  );
}
