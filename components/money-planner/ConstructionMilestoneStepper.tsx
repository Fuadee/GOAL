import { ConstructionMilestoneView } from '@/lib/money/types';

type Props = {
  milestones: ConstructionMilestoneView[];
};

const STATUS_STYLES: Record<ConstructionMilestoneView['status'], string> = {
  done: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
  current: 'border-cyan-300/60 bg-cyan-500/10 text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-[1.02]',
  upcoming: 'border-white/10 bg-slate-900/70 text-slate-300'
};

function StepIcon({ status }: { status: ConstructionMilestoneView['status'] }) {
  if (status === 'done') return <span aria-hidden>✓</span>;
  if (status === 'current') return <span aria-hidden>◉</span>;
  return <span aria-hidden>○</span>;
}

export function ConstructionMilestoneStepper({ milestones }: Props) {
  return (
    <div>
      <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {milestones.map((step, index) => (
          <li key={step.id} className="relative">
            {index < milestones.length - 1 ? (
              <span className="pointer-events-none absolute -right-2 top-1/2 hidden h-px w-4 bg-slate-700 xl:block" aria-hidden />
            ) : null}
            <article className={`rounded-xl border p-2.5 transition ${STATUS_STYLES[step.status]}`}>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide">
                <StepIcon status={step.status} />
                <span>Step {step.order}</span>
              </div>
              <p className="mt-1.5 text-sm font-semibold leading-snug">{step.title}</p>
              <p className="mt-1 text-[11px] opacity-80">{step.targetDateLabel}</p>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
