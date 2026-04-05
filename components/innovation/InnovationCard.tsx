export type InnovationStatus = 'idea' | 'building' | 'done';

export type Innovation = {
  id: string;
  title: string;
  description: string;
  status: InnovationStatus;
};

type InnovationCardProps = {
  innovation: Innovation;
  onMarkDone: (id: string) => void;
  onDelete: (id: string) => void;
};

const statusStyles: Record<InnovationStatus, string> = {
  idea: 'bg-slate-500/20 text-slate-300 border border-slate-400/30',
  building: 'bg-amber-500/20 text-amber-300 border border-amber-400/40',
  done: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
};

export function InnovationCard({ innovation, onMarkDone, onDelete }: InnovationCardProps) {
  const isDone = innovation.status === 'done';

  return (
    <article className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition duration-300 hover:scale-105 hover:border-white/20">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-white">{innovation.title}</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[innovation.status]}`}>
            {innovation.status}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">{innovation.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onMarkDone(innovation.id)}
          disabled={isDone}
          className="rounded-full bg-indigo-400/20 px-4 py-2 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-400/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark as done
        </button>
        <button
          type="button"
          onClick={() => onDelete(innovation.id)}
          className="rounded-full bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/30"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
