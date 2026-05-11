import { notFound } from 'next/navigation';

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

type InnovationDetailPageProps = {
  params: { id: string };
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default async function InnovationDetailPage({ params }: InnovationDetailPageProps) {
  const data = await getInnovationDetailData(params.id);
  if (!data) notFound();

  const { innovation, steps, completedStepCount, progressPercent } = data;
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

      </section>
    </main>
  );
}
