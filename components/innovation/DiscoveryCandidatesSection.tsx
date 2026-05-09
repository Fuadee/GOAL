import Link from 'next/link';

import { getDiscoveryCandidateStateMeta } from '@/lib/innovation/helpers';
import { DiscoveryCandidateRow, DiscoveryCandidateState } from '@/lib/innovation/types';

const STATE_STYLES: Record<DiscoveryCandidateState, string> = {
  observed: 'bg-slate-500/20 text-slate-200',
  pain_point: 'bg-rose-500/20 text-rose-200',
  concept: 'bg-indigo-500/20 text-indigo-200',
  validated: 'bg-emerald-500/20 text-emerald-200',
  converted: 'bg-cyan-500/20 text-cyan-200'
};

type DiscoveryCandidatesSectionProps = {
  candidates: DiscoveryCandidateRow[];
};

function getProblemPreview(candidate: DiscoveryCandidateRow): string {
  if (candidate.problem?.trim()) {
    return candidate.problem.trim();
  }

  return candidate.notes?.trim() || 'ยังไม่ได้ระบุปัญหา';
}

export function DiscoveryCandidatesSection({ candidates }: DiscoveryCandidatesSectionProps) {
  return (
    <section id="discovery-candidates" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Candidate Queue</h2>
          <p className="text-sm text-slate-600">Ideas waiting for execution.</p>
        </div>
        <Link href="/innovation/discovery/new" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm">
          + Add Candidate
        </Link>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-slate-700">
          <p className="font-medium">No candidates in queue.</p>
          <p className="text-sm text-slate-500">Add one idea and start mission.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {candidates.map((candidate) => {
            const stateMeta = getDiscoveryCandidateStateMeta(candidate);
            const problemPreview = getProblemPreview(candidate);

            return (
              <article key={candidate.id} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-1 text-base font-semibold text-slate-900">{candidate.title}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATE_STYLES[stateMeta.state]}`}>{stateMeta.label}</span>
                </div>

                <p className="line-clamp-2 text-sm text-slate-700">{problemPreview}</p>
                <p className="line-clamp-1 text-xs text-slate-500">{stateMeta.description}</p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href={`/innovation/discovery/${candidate.id}`} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
                    Start Mission
                  </Link>
                  <Link href={`/innovation/discovery/${candidate.id}`} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800">
                    Open
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
