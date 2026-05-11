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
  update: 'bg-slate-500/20 text-slate-300 border border-slate-400/30',
  problem: 'bg-rose-500/20 text-rose-300 border border-rose-400/40',
  solution: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40',
  decision: 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40',
  lesson: 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
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
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 md:px-8 md:py-14">
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Mission Overview</p>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">{innovation.title}</h1>
          <p className="text-sm text-slate-300">{innovation.description || 'No description provided.'}</p>
          <p className="text-sm text-slate-300">Goal: {innovation.goal || 'No goal provided.'}</p>
          <div className="grid gap-2 text-sm text-slate-300 md:grid-cols-3">
            <p>Status: <span className="font-semibold text-white">{stateMeta.label}</span> ({derivedState})</p>
            <p>Progress: <span className="font-semibold text-white">{progressPercent}%</span> ({completedStepCount}/{stepTotal})</p>
            <p>Active: <span className="font-semibold text-cyan-200">{summary.active}</span> · Blocked: <span className="font-semibold text-rose-200">{summary.blocked}</span> · Waiting: <span className="font-semibold text-amber-200">{summary.waiting}</span> · Done: <span className="font-semibold text-emerald-200">{summary.done}/{summary.total}</span></p>
            <p>Updated: <span className="text-white">{formatTimestamp(innovation.updated_at)}</span></p>
          </div>
        </section>

        <InnovationProcessSection
          innovationId={innovation.id}
          currentFocus={getCurrentMissionFocus(mission)}
          steps={steps}
        />

        <details className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <summary className="cursor-pointer text-xl font-semibold text-white">Execution Log</summary>
          <AddInnovationLogForm innovationId={innovation.id} />
        </details>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Timeline</h2>
          {logs.length === 0 ? <p className="text-slate-300">No logs yet. Start documenting your execution history.</p> : (
            <ol className="relative space-y-6 border-l border-white/10 pl-6">
              {logs.map((log) => (
                <li key={log.id} className="relative">
                  <span className="absolute -left-[1.95rem] top-2 h-3 w-3 rounded-full bg-indigo-300 shadow-[0_0_16px_rgba(129,140,248,0.9)]" />
                  <article className="space-y-2 rounded-xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold text-white">{log.title}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${logTypeStyles[log.log_type]}`}>{log.log_type}</span>
                    </div>
                    <p className="text-xs font-medium text-indigo-200">{formatTimestamp(log.created_at)}</p>
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
