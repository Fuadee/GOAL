import { notFound } from 'next/navigation';

import { AddInnovationLogForm } from '@/components/innovation/AddInnovationLogForm';
import { InnovationProcessSection } from '@/components/innovation/InnovationProcessSection';
import { Navbar } from '@/components/navbar';
import { getInnovationDetailData } from '@/lib/innovation/service';
import {
  deriveInnovationState,
  getCurrentMissionFocus,
  getStepStatusSummary,
  getInnovationStateMeta,
  getMissionProgress
} from '@/lib/innovation/helpers';
import { InnovationLogType } from '@/lib/innovation/types';

type InnovationDetailPageProps = {
  params: { id: string };
};

const logTypeStyles: Record<InnovationLogType, string> = {
  update: 'border border-slate-200 bg-slate-100 text-slate-700',
  problem: 'border border-rose-200 bg-rose-50 text-rose-700',
  solution: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  decision: 'border border-indigo-200 bg-indigo-50 text-indigo-700',
  lesson: 'border border-amber-200 bg-amber-50 text-amber-700'
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default async function InnovationDetailPage({ params }: InnovationDetailPageProps) {
  const data = await getInnovationDetailData(params.id);
  if (!data) notFound();

  const { innovation, logs, steps, completedStepCount, progressPercent } = data;
  const mission = { ...innovation, stepTotal: steps.length, completedStepCount, progressPercent, steps, nextStep: null };
  const stateMeta = getInnovationStateMeta(mission);
  const derivedState = deriveInnovationState(mission);
  const { stepTotal } = getMissionProgress(mission);
  const summary = getStepStatusSummary(mission);

  return (
    <main className="min-h-screen bg-slate-100">
      <Navbar />
      <section className="page-container mx-auto w-full max-w-4xl space-y-4 px-4 py-4 sm:space-y-5 md:py-6">
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Mission Overview</p>
          <h1 className="text-2xl font-semibold text-slate-950 md:text-3xl">{innovation.title}</h1>
          <p className="text-sm text-slate-700">{innovation.description || 'No description provided.'}</p>
          <p className="text-sm text-slate-700">Goal: {innovation.goal || 'No goal provided.'}</p>
          <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
            <p>Status: <span className="font-semibold text-slate-900">{stateMeta.label}</span> ({derivedState})</p>
            <p>Progress: <span className="font-semibold text-slate-900">{progressPercent}%</span> ({completedStepCount}/{stepTotal})</p>
            <p>Active: <span className="font-semibold text-cyan-700">{summary.active}</span> · Blocked: <span className="font-semibold text-rose-700">{summary.blocked}</span> · Waiting: <span className="font-semibold text-amber-700">{summary.waiting}</span> · Done: <span className="font-semibold text-emerald-700">{summary.done}/{summary.total}</span></p>
            <p>Updated: <span className="text-slate-900">{formatTimestamp(innovation.updated_at)}</span></p>
          </div>
        </section>

        <InnovationProcessSection
          innovationId={innovation.id}
          currentFocus={getCurrentMissionFocus(mission)}
          steps={steps}
        />

        <details className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <summary className="cursor-pointer text-xl font-semibold text-slate-900">Execution Log</summary>
          <AddInnovationLogForm innovationId={innovation.id} />
        </details>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Timeline</h2>
          {logs.length === 0 ? <p className="text-slate-600">No logs yet. Start documenting your execution history.</p> : (
            <ol className="relative space-y-4 border-l border-slate-200 pl-6">
              {logs.map((log) => (
                <li key={log.id} className="relative">
                  <span className="absolute -left-[1.95rem] top-2 h-3 w-3 rounded-full bg-indigo-400" />
                  <article className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">{log.title}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${logTypeStyles[log.log_type]}`}>{log.log_type}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500">{formatTimestamp(log.created_at)}</p>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </section>
      </section>
    </main>
  );
}
