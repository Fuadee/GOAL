import Link from 'next/link';

import { getDiscoveryCandidateStateMeta, getPrimaryDiscoveryActionLabel } from '@/lib/innovation/helpers';
import { DiscoveryCandidateRow, DiscoveryCandidateState } from '@/lib/innovation/types';

const STATE_STYLES: Record<DiscoveryCandidateState, string> = {
  observed: 'bg-slate-500/20 text-[#64748B]',
  pain_point: 'bg-rose-500/20 text-rose-200',
  concept: 'bg-[#EEF1EA]/20 text-[#334155]',
  validated: 'bg-emerald-500/20 text-emerald-200',
  converted: 'bg-[#EEF1EA]/20 text-[#64748B]'
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
    <section id="discovery-candidates" className="space-y-4 premium-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-[#1E293B]">🧠 Discovery Candidates</h2>
        <Link href="/innovation/discovery/new" className="theme-button-secondary">
          + Add Candidate
        </Link>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#DDE3D5] bg-white/30 p-5 text-[#64748B]">
          <p className="font-medium">ยังไม่มี discovery candidates</p>
          <p className="text-sm text-[#94A3B8]">เริ่มจากการบันทึก pain point ตัวแรก</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {candidates.map((candidate) => {
            const stateMeta = getDiscoveryCandidateStateMeta(candidate);
            const primaryAction = getPrimaryDiscoveryActionLabel(candidate);
            const problemPreview = getProblemPreview(candidate);

            return (
              <article key={candidate.id} className="space-y-3 rounded-xl border border-[#DDE3D5] bg-white/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-[#1E293B]">{candidate.title}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATE_STYLES[stateMeta.state]}`}>{stateMeta.label}</span>
                </div>

                <p className="line-clamp-2 text-sm text-[#1E293B]">{problemPreview}</p>
                <p className="text-sm text-[#64748B]">Why this state: {stateMeta.description}</p>
                {candidate.source ? <p className="text-xs text-[#94A3B8]">Source: {candidate.source}</p> : null}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href={`/innovation/discovery/${candidate.id}`} className="rounded-full bg-[#EEF1EA]/20 px-3 py-2 text-xs font-semibold text-[#334155] hover:bg-[#EEF1EA]">
                    {primaryAction}
                  </Link>
                  <Link href={`/innovation/discovery/${candidate.id}`} className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-[#1E293B] hover:bg-white/20">
                    Open detail
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
