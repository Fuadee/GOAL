import Link from 'next/link';

import { getDiscoveryCandidateStateMeta } from '@/lib/innovation/helpers';
import { DiscoveryCandidateRow, DiscoveryCandidateState } from '@/lib/innovation/types';
import { innovationUi, statusBadge } from './uiTokens';

const STATE_STYLES: Record<DiscoveryCandidateState, string> = {
  observed: `${statusBadge.base} ${statusBadge.neutral}`,
  pain_point: `${statusBadge.base} border border-rose-200 bg-rose-50 text-rose-700`,
  concept: `${statusBadge.base} ${statusBadge.concept}`,
  validated: `${statusBadge.base} border border-cyan-200 bg-cyan-50 text-cyan-800`,
  converted: `${statusBadge.base} ${statusBadge.building}`
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
    <section id="discovery-candidates" className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={innovationUi.sectionTitle}>Candidate Queue</h2>
          <p className={innovationUi.sectionSubtitle}>Ideas waiting for execution.</p>
        </div>
        <Link href="/innovation/discovery/new" className={innovationUi.headerOutlineButton}>
          + Add Candidate
        </Link>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-4 text-slate-700">
          <p className="font-medium">No candidates in queue.</p>
          <p className="text-sm text-slate-500">Add one idea and start mission.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {candidates.map((candidate) => {
            const stateMeta = getDiscoveryCandidateStateMeta(candidate);
            const problemPreview = getProblemPreview(candidate);

            return (
              <article key={candidate.id} className="space-y-2 rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-1 text-base font-semibold text-slate-900">{candidate.title}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATE_STYLES[stateMeta.state]}`}>{stateMeta.label}</span>
                </div>

                <p className="line-clamp-2 text-sm text-slate-700">{problemPreview}</p>
                <p className="line-clamp-1 text-xs text-slate-500">{stateMeta.description}</p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href={`/innovation/discovery/${candidate.id}`} className={innovationUi.primaryButton}>
                    Start Mission
                  </Link>
                  <Link href={`/innovation/discovery/${candidate.id}`} className={innovationUi.secondaryButton}>
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
