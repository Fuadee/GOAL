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
  todo: 'border border-slate-200 bg-slate-100 text-slate-700',
  waiting: 'border border-amber-200 bg-amber-50 text-amber-700',
  in_progress: 'border border-cyan-200 bg-cyan-50 text-cyan-800',
  blocked: 'border border-rose-200 bg-rose-50 text-rose-700',
  completed: 'border border-emerald-200 bg-emerald-50 text-emerald-700'
};
const STATUS_ORDER: InnovationStepStatus[] = ['in_progress', 'blocked', 'waiting', 'todo', 'completed'];
const STATUS_LABEL: Record<InnovationStepStatus, string> = { todo: 'TODO', waiting: 'WAITING', in_progress: 'IN PROGRESS', blocked: 'BLOCKED', completed: 'DONE' };
const PRIMARY_ACTIONS: Record<InnovationStepStatus, { label: string; target: InnovationStepStatus }> = {
  todo: { label: 'Start', target: 'in_progress' },
  waiting: { label: 'Start', target: 'in_progress' },
  in_progress: { label: 'Mark Done', target: 'completed' },
  blocked: { label: 'Resolve', target: 'in_progress' },
  completed: { label: 'Reopen', target: 'in_progress' }
};

export function InnovationProcessSection({ innovationId, currentFocus, steps }: InnovationProcessSectionProps) {
  const router = useRouter(); const [isPending, startTransition] = useTransition(); const [error, setError] = useState<string | null>(null);
  const groups = STATUS_ORDER.map((status) => ({ status, steps: steps.filter((s) => s.status === status) }));

  const setStatus = (stepId: string, status: InnovationStepStatus) => startTransition(async () => { await updateStepStatusAction(innovationId, stepId, status); router.refresh(); });
  const primary = (status: InnovationStepStatus): { label: string; target: InnovationStepStatus } => PRIMARY_ACTIONS[status];

  return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current Focus</h2>
      {!currentFocus ? <p className="text-slate-600">ยังไม่มี step สำหรับ mission นี้</p> : <article className="space-y-3"><p className="text-lg font-semibold text-slate-900">{currentFocus.title}</p><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stepStatusStyles[currentFocus.status]}`}>{STATUS_LABEL[currentFocus.status]}</span><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setStatus(currentFocus.id, primary(currentFocus.status).target)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{primary(currentFocus.status).label}</button><select defaultValue={currentFocus.status} onChange={(e) => setStatus(currentFocus.id, e.target.value as InnovationStepStatus)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700"><option value="todo">Todo</option><option value="waiting">Waiting</option><option value="in_progress">In Progress</option><option value="blocked">Blocked</option><option value="completed">Completed</option></select></div></article>}
    </div>

    <details id="add-step" className="rounded-xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">+ Add Step</summary><form action={(formData) => { setError(null); startTransition(async () => { const result = await createInnovationProcessStepAction(innovationId, formData); if (!result.success) { setError(result.message); return; } router.refresh(); }); }} className="mt-3 grid gap-3"><input name="title" type="text" required placeholder="Step title" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"/><textarea name="description" rows={2} placeholder="Step description" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"/><select name="status" defaultValue="todo" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"><option value="todo">Todo</option><option value="waiting">Waiting</option><option value="in_progress">In Progress</option><option value="blocked">Blocked</option><option value="completed">Completed</option></select><input name="note" type="text" placeholder="Note / waiting reason / blocker" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"/>{error ? <p className="text-sm text-rose-600">{error}</p> : null}<button type="submit" disabled={isPending} className="w-fit rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{isPending ? 'Saving...' : 'Save'}</button></form></details>

    <section className="space-y-3"><h3 className="text-xl font-semibold text-slate-900">Process Board</h3>{groups.map((group) => {
      const content = <ul className="space-y-2">{group.steps.map((step) => <li key={step.id} className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-medium text-slate-900">{step.title}</p>{step.note ? <p className="text-xs text-slate-600">{step.note}</p> : null}<p className="text-[11px] text-slate-500">Updated {new Date(step.updated_at).toLocaleDateString()}</p></div><div className="flex flex-col gap-2"><button type="button" className="rounded-xl bg-slate-900 px-3 py-1 text-xs text-white" onClick={() => setStatus(step.id, primary(step.status).target)}>{primary(step.status).label}</button><select defaultValue={step.status} onChange={(e) => setStatus(step.id, e.target.value as InnovationStepStatus)} className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700"><option value="todo">Todo</option><option value="waiting">Waiting</option><option value="in_progress">In Progress</option><option value="blocked">Blocked</option><option value="completed">Completed</option></select></div></div></li>)}</ul>;
      if (group.status === 'completed') return <details key={group.status} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><summary className="cursor-pointer text-sm font-semibold text-slate-600">DONE ({group.steps.length})</summary>{content}</details>;
      return <div key={group.status} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="mb-2 text-sm font-semibold text-slate-700">{STATUS_LABEL[group.status]} ({group.steps.length})</p>{group.steps.length === 0 ? <p className="text-xs text-slate-500">No steps.</p> : content}</div>;
    })}</section>
  </section>;
}
