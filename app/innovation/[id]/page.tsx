import { notFound } from 'next/navigation';

import { AddInnovationLogForm } from '@/components/innovation/AddInnovationLogForm';
import { InnovationProcessSection } from '@/components/innovation/InnovationProcessSection';
import { Navbar } from '@/components/navbar';
import { getInnovationDetailData } from '@/lib/innovation/service';
import { deriveInnovationState, getInnovationStateMeta } from '@/lib/innovation/helpers';
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

  if (!data) {
    notFound();
  }

  const { innovation, logs, steps, completedStepCount, progressPercent } = data;
  const innovationWithSteps = {
    ...innovation,
    stepTotal: steps.length,
    completedStepCount,
    progressPercent,
    steps,
    nextStep: steps.find((step) => step.status !== 'done') ?? null
  };
  const stateMeta = getInnovationStateMeta(innovationWithSteps);
  const derivedState = deriveInnovationState(innovationWithSteps);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <section className="mx-auto w-full max-w-6xl space-y-8 px-6 py-16 md:px-10 md:py-20">
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Innovation Detail</p>
          <h1 className="text-3xl font-semibold text-white">{innovation.title}</h1>
          <p className="text-slate-300">{innovation.description || 'No description provided.'}</p>
          <p className="text-slate-300">Goal: {innovation.goal || 'No goal provided.'}</p>
          <div className="grid gap-2 text-sm text-slate-300 md:grid-cols-2">
            <p>State: <span className="font-semibold text-white">{stateMeta.label}</span> ({derivedState})</p>
            <p>Why: <span className="text-white">{stateMeta.description}</span></p>
            <p>Progress: <span className="font-semibold text-white">{progressPercent}%</span></p>
            <p>Created: <span className="text-white">{formatTimestamp(innovation.created_at)}</span></p>
            <p>Updated: <span className="text-white">{formatTimestamp(innovation.updated_at)}</span></p>
          </div>

          {innovation.is_blocked && innovation.blocked_reason ? (
            <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">Blocked reason: {innovation.blocked_reason}</p>
          ) : null}

          <section className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-sm text-slate-200">{completedStepCount} / {steps.length} steps completed</p>
          </section>
        </section>

        <InnovationProcessSection innovationId={innovation.id} steps={steps} />

        <AddInnovationLogForm innovationId={innovation.id} />

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Execution Timeline</h2>

          {logs.length === 0 ? (
            <p className="text-slate-300">No logs yet. Start documenting your execution history.</p>
          ) : (
            <ol className="relative space-y-6 border-l border-white/10 pl-6">
              {logs.map((log) => (
                <li key={log.id} className="relative">
                  <span className="absolute -left-[1.95rem] top-2 h-3 w-3 rounded-full bg-indigo-300 shadow-[0_0_16px_rgba(129,140,248,0.9)]" />
                  <article className="space-y-2 rounded-xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold text-white">{log.title}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${logTypeStyles[log.log_type]}`}>
                        {log.log_type}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-indigo-200">{formatTimestamp(log.created_at)}</p>
                    {log.detail ? <p className="text-sm text-slate-200">{log.detail}</p> : null}
                    {log.problem ? <p className="text-sm text-rose-200"><span className="font-semibold">Problem:</span> {log.problem}</p> : null}
                    {log.solution ? <p className="text-sm text-emerald-200"><span className="font-semibold">Solution:</span> {log.solution}</p> : null}
                    {log.result ? <p className="text-sm text-sky-200"><span className="font-semibold">Result:</span> {log.result}</p> : null}
                    {log.lesson_learned ? <p className="text-sm text-amber-200"><span className="font-semibold">Lesson learned:</span> {log.lesson_learned}</p> : null}
                    {log.next_step ? <p className="text-sm text-violet-200"><span className="font-semibold">Next step:</span> {log.next_step}</p> : null}
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
