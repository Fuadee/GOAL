import { DiscoveryCandidatesSection } from '@/components/innovation/DiscoveryCandidatesSection';
import { DiscoveryGapSection } from '@/components/innovation/DiscoveryGapSection';
import { InnovationCard } from '@/components/innovation/InnovationCard';
import { ProgressBar } from '@/components/innovation/ProgressBar';
import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';
import { getInnovationDashboardPageData } from '@/lib/innovation/service';
import { deriveInnovationState } from '@/lib/innovation/helpers';
import { innovationUi } from '@/components/innovation/uiTokens';

const TARGET_INNOVATIONS = 10;

export default async function InnovationPage() {
  const { innovations, currentMission, discoveryCandidates, discoveryGap } = await getInnovationDashboardPageData(TARGET_INNOVATIONS);
  const activeInnovations = innovations.filter((innovation) => deriveInnovationState(innovation) !== 'completed');
  const completedInnovations = innovations.filter((innovation) => deriveInnovationState(innovation) === 'completed');

  return (
    <PageShell>
      <Navbar />
      <section className="page-container mx-auto max-w-4xl space-y-3 sm:space-y-4">
        <header className="space-y-1 pt-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">GOAL</p>
          <h1 className="text-base font-semibold text-slate-900">Founder Execution Workspace</h1>
        </header>

        {innovations.length === 0 ? (
          <>
            <section className="premium-card border-dashed p-10 text-center"><p className="text-[color:var(--text-secondary)]">No innovation yet. Start building your future.</p></section>
            <DiscoveryGapSection
              currentCount={innovations.length}
              goalCount={TARGET_INNOVATIONS}
              gap={discoveryGap}
              candidateCount={discoveryCandidates.length}
              activeMissionCount={currentMission ? 1 : 0}
            />
            <DiscoveryCandidatesSection candidates={discoveryCandidates} />
            <ProgressBar current={innovations.length} total={TARGET_INNOVATIONS} activeCount={activeInnovations.length} completedCount={completedInnovations.length} />
          </>
        ) : (
          <>
            <section className="space-y-2">
              <div>
                <h2 className={innovationUi.sectionTitle}>Active Mission</h2>
                <p className={innovationUi.sectionSubtitle}>Work currently in progress.</p>
              </div>
              <div className="grid gap-3">
                {currentMission ? <InnovationCard innovation={currentMission} isCurrent /> : <p className="text-sm text-slate-600">No active mission yet.</p>}
              </div>
            </section>

            <DiscoveryGapSection
              currentCount={innovations.length}
              goalCount={TARGET_INNOVATIONS}
              gap={discoveryGap}
              candidateCount={discoveryCandidates.length}
              activeMissionCount={currentMission ? 1 : 0}
            />

            <DiscoveryCandidatesSection candidates={discoveryCandidates} />

            <ProgressBar current={innovations.length} total={TARGET_INNOVATIONS} activeCount={activeInnovations.length} completedCount={completedInnovations.length} />

            <details className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">Completed Missions ({completedInnovations.length})</summary>
              <div className="mt-3 grid gap-2">
                {completedInnovations.map((innovation) => (
                  <InnovationCard key={innovation.id} innovation={innovation} compactCompleted />
                ))}
              </div>
            </details>
          </>
        )}
      </section>
    </PageShell>
  );
}
