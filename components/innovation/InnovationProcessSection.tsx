'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createInnovationProcessStepAction, updateStepStatusAction } from '@/app/innovation/[id]/actions';
import { InnovationProcessStepSummary, InnovationStepStatus } from '@/lib/innovation/types';

type InnovationProcessSectionProps = {
  innovationId: string;
  currentFocus: InnovationProcessStepSummary | null;
  steps: InnovationProcessStepSummary[];
};

const stepStatusStyles: Record<InnovationStepStatus, string> = {
  todo: 'bg-slate-500/20 text-slate-100 border border-slate-400/40',
  waiting: 'bg-amber-500/20 text-amber-100 border border-amber-400/40',
  in_progress: 'bg-cyan-500/20 text-cyan-100 border border-cyan-400/40',
  blocked: 'bg-rose-500/20 text-rose-100 border border-rose-400/40',
  completed: 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/40'
};
const STATUS_ORDER: InnovationStepStatus[] = ['in_progress', 'blocked', 'waiting', 'todo', 'completed'];
const STATUS_LABEL: Record<InnovationStepStatus, string> = { todo: 'TODO', waiting: 'WAITING', in_progress: 'IN PROGRESS', blocked: 'BLOCKED', completed: 'DONE' };

export function InnovationProcessSection({ innovationId, currentFocus, steps }: InnovationProcessSectionProps) {
  const router = useRouter(); const [isPending, startTransition] = useTransition(); const [error, setError] = useState<string | null>(null);
  const groups = STATUS_ORDER.map((status) => ({ status, steps: steps.filter((s) => s.status === status) }));

  const setStatus = (stepId: string, status: InnovationStepStatus) => startTransition(async () => { await updateStepStatusAction(innovationId, stepId, status); router.refresh(); });
  const primary = (status: InnovationStepStatus): { label: string; target: InnovationStepStatus } => ({ todo: { label: 'Start', target: 'in_progress' }, waiting: { label: 'Start', target: 'in_progress' }, in_progress: { label: 'Mark Done', target: 'completed' }, blocked: { label: 'Resolve', target: 'in_progress' }, completed: { label: 'Reopen', target: 'in_progress' } }[status]);

  return <section className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
    <div className="space-y-4 rounded-2xl border border-cyan-200/30 bg-slate-900/80 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Current Focus</h2>
      {!currentFocus ? <p className="text-slate-300">ยังไม่มี step สำหรับ mission นี้</p> : <article className="space-y-3"><p className="text-lg font-semibold text-white">{currentFocus.title}</p><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stepStatusStyles[currentFocus.status]}`}>{STATUS_LABEL[currentFocus.status]}</span><div className="flex gap-2"><button type="button" onClick={() => setStatus(currentFocus.id, primary(currentFocus.status).target)} className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white">{primary(currentFocus.status).label}</button><select defaultValue={currentFocus.status} onChange={(e) => setStatus(currentFocus.id, e.target.value as InnovationStepStatus)} className="rounded-full border border-white/20 bg-slate-900 px-3 py-2 text-xs text-white"><option value="todo">Todo</option><option value="waiting">Waiting</option><option value="in_progress">In Progress</option><option value="blocked">Blocked</option><option value="completed">Completed</option></select></div></article>}
    </div>

    <details id="add-step" className="rounded-xl border border-white/10 bg-slate-900/40 p-4"><summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">+ Add Step</summary><form action={(formData) => { setError(null); startTransition(async () => { const result = await createInnovationProcessStepAction(innovationId, formData); if (!result.success) { setError(result.message); return; } router.refresh(); }); }} className="mt-3 grid gap-3"><input name="title" type="text" required placeholder="Step title" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white"/><textarea name="description" rows={2} placeholder="Step description" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white"/><select name="status" defaultValue="todo" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white"><option value="todo">Todo</option><option value="waiting">Waiting</option><option value="in_progress">In Progress</option><option value="blocked">Blocked</option><option value="completed">Completed</option></select><input name="note" type="text" placeholder="Note / waiting reason / blocker" className="rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white"/>{error ? <p className="text-sm text-rose-300">{error}</p> : null}<button type="submit" disabled={isPending} className="w-fit rounded-full bg-indigo-400/20 px-4 py-2 text-sm font-semibold text-indigo-200">{isPending ? 'Saving...' : 'Save'}</button></form></details>

    <section className="space-y-3"><h3 className="text-xl font-semibold text-white">Process Board</h3>{groups.map((group) => {
      const content = <ul className="space-y-2">{group.steps.map((step) => <li key={step.id} className="rounded-lg border border-white/10 bg-slate-900/40 p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-sm text-white">{step.title}</p>{step.note ? <p className="text-xs text-slate-300">{step.note}</p> : null}<p className="text-[11px] text-slate-400">Updated {new Date(step.updated_at).toLocaleDateString()}</p></div><div className="flex flex-col gap-2"><button type="button" className="rounded-full bg-slate-700 px-3 py-1 text-xs text-white" onClick={() => setStatus(step.id, primary(step.status).target)}>{primary(step.status).label}</button><select defaultValue={step.status} onChange={(e) => setStatus(step.id, e.target.value as InnovationStepStatus)} className="rounded-full border border-white/20 bg-slate-900 px-3 py-1 text-xs text-white"><option value="todo">Todo</option><option value="waiting">Waiting</option><option value="in_progress">In Progress</option><option value="blocked">Blocked</option><option value="completed">Completed</option></select></div></div></li>)}</ul>;
      if (group.status === 'completed') return <details key={group.status} className="rounded-xl border border-white/10 bg-slate-900/30 p-3"><summary className="cursor-pointer text-sm font-semibold text-slate-300">DONE ({group.steps.length})</summary>{content}</details>;
      return <div key={group.status} className="rounded-xl border border-white/10 bg-slate-900/30 p-3"><p className="mb-2 text-sm font-semibold text-slate-200">{STATUS_LABEL[group.status]} ({group.steps.length})</p>{group.steps.length === 0 ? <p className="text-xs text-slate-400">No steps.</p> : content}</div>;
    })}</section>
  </section>;
}
