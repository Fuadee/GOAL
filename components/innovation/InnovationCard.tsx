import Link from 'next/link';

import { InnovationCardViewModel, InnovationStatus } from '@/lib/innovation/types';

type InnovationCardProps = {
  innovation: InnovationCardViewModel;
  isCurrent?: boolean;
};

const statusStyles: Record<InnovationStatus, string> = {
  idea: 'bg-slate-500/20 text-slate-300 border border-slate-400/30',
  building: 'bg-amber-500/20 text-amber-300 border border-amber-400/40',
  testing: 'bg-sky-500/20 text-sky-300 border border-sky-400/40',
  blocked: 'bg-rose-500/20 text-rose-300 border border-rose-400/40',
  completed: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function InnovationCard({ innovation, isCurrent = false }: InnovationCardProps) {
  return (
    <article className={`space-y-4 rounded-2xl border bg-white/5 p-5 backdrop-blur transition duration-300 hover:scale-[1.01] ${isCurrent ? 'border-amber-300/50 shadow-[0_0_25px_rgba(251,191,36,0.2)]' : 'border-white/10 hover:border-white/20'}`}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-white">{innovation.title}</h3>
          <div className="flex items-center gap-2">
            {isCurrent ? <span className="rounded-full bg-amber-400/30 px-2 py-1 text-[10px] font-bold text-amber-100">CURRENT 🔥</span> : null}
            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[innovation.status]}`}>
              {innovation.status}
            </span>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">{innovation.description || 'No description yet.'}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 sm:grid-cols-3">
        <div>
          <p className="text-slate-400">Progress</p>
          <p className="font-semibold text-white">{innovation.progressPercent}%</p>
        </div>
        <div>
          <p className="text-slate-400">Steps</p>
          <p className="font-semibold text-white">{innovation.completedStepCount} / {innovation.stepTotal}</p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-slate-400">Updated</p>
          <p className="font-semibold text-white">{formatTimestamp(innovation.updated_at)}</p>
        </div>
      </div>

      <p className="text-sm text-slate-200">
        Next: <span className="font-semibold text-white">→ {innovation.nextStep?.title ?? 'No pending step'}</span>
      </p>

      <Link
        href={`/innovation/${innovation.id}`}
        className="inline-flex rounded-full bg-indigo-400/20 px-4 py-2 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-400/30"
      >
        Open details
      </Link>
    </article>
  );
}
