import { ConstructionMilestoneView } from '@/lib/money/types';

type Props = {
  milestones: ConstructionMilestoneView[];
};

const STATUS_STYLES: Record<ConstructionMilestoneView['status'], string> = {
  done: 'border-emerald-400/35 bg-white text-emerald-100 shadow-sm',
  current:
    'border-[#DDE3D5]/70 bg-white text-[#334155] shadow-sm scale-[1.025]',
  upcoming: 'border-white/12 bg-white text-[#64748B] opacity-80'
};
const STATUS_LABELS: Record<ConstructionMilestoneView['status'], string> = {
  done: 'Completed',
  current: 'In progress',
  upcoming: 'Waiting'
};

function StepIcon({ status }: { status: ConstructionMilestoneView['status'] }) {
  if (status === 'done') return <span aria-hidden>✓</span>;
  if (status === 'current') return <span aria-hidden>◉</span>;
  return <span aria-hidden>○</span>;
}

export function ConstructionMilestoneStepper({ milestones }: Props) {
  return (
    <div>
      <ol className="flex flex-wrap gap-x-4 gap-y-5 md:gap-x-5 md:gap-y-6">
        {milestones.map((step, index) => (
          <li
            key={step.id}
            className={`relative min-w-[220px] flex-1 basis-[260px] ${
              index < 2 ? 'md:basis-[320px] xl:basis-[360px]' : ''
            }`}
          >
            {index < milestones.length - 1 ? (
              <span
                className="pointer-events-none absolute -right-2 top-1/2 hidden h-px w-3 bg-white md:block"
                aria-hidden
              />
            ) : null}
            <article className={`group relative rounded-2xl border p-4 transition duration-300 ${STATUS_STYLES[step.status]}`}>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_45%)]"
              />
              <div className="relative flex items-center gap-2 text-[11px] uppercase tracking-[0.14em]">
                <StepIcon status={step.status} />
                <span>Step {step.order}</span>
              </div>
              <p className="relative mt-2 text-sm font-semibold leading-snug">{step.title}</p>
              <p className="relative mt-2 text-[11px] uppercase tracking-[0.12em] opacity-80">Status: {STATUS_LABELS[step.status]}</p>
              {step.expectedByLabel ? <p className="relative mt-2 text-[11px] opacity-80">{step.expectedByLabel}</p> : null}
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
