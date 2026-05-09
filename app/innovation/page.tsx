import { DiscoveryCandidatesSection } from '@/components/innovation/DiscoveryCandidatesSection';
import { DiscoveryGapSection } from '@/components/innovation/DiscoveryGapSection';
import { InnovationCard } from '@/components/innovation/InnovationCard';
import { ProgressBar } from '@/components/innovation/ProgressBar';
import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';
import { getInnovationDashboardPageData } from '@/lib/innovation/service';
import { deriveInnovationState } from '@/lib/innovation/helpers';

const TARGET_INNOVATIONS = 10;

export default async function InnovationPage() {
  const { innovations, currentMission, discoveryCandidates, discoveryGap, nextDiscoveryAction } = await getInnovationDashboardPageData(TARGET_INNOVATIONS);
  const activeInnovations = innovations.filter((innovation) => deriveInnovationState(innovation) !== 'completed');
  const completedInnovations = innovations.filter((innovation) => deriveInnovationState(innovation) === 'completed');

  return (
    <PageShell>
      <Navbar />
      <section className="page-container space-y-5">
        <ProgressBar current={innovations.length} total={TARGET_INNOVATIONS} activeCount={activeInnovations.length} completedCount={completedInnovations.length} />
        <DiscoveryGapSection
          currentCount={innovations.length}
          goalCount={TARGET_INNOVATIONS}
          gap={discoveryGap}
          candidateCount={discoveryCandidates.length}
          nextAction={nextDiscoveryAction}
        />
        <DiscoveryCandidatesSection candidates={discoveryCandidates} />
        {innovations.length === 0 ? (
          <section className="premium-card border-dashed p-10 text-center"><p className="text-[color:var(--text-secondary)]">No innovation yet. Start building your future.</p></section>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">Active Innovations</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activeInnovations.map((innovation) => (
                  <InnovationCard key={innovation.id} innovation={innovation} isCurrent={currentMission?.id === innovation.id} />
                ))}
              </div>
            </section>

            <details className="rounded-2xl border border-slate-200 bg-white p-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">Completed Innovations ({completedInnovations.length})</summary>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {completedInnovations.map((innovation) => (
                  <InnovationCard key={innovation.id} innovation={innovation} isCurrent={false} />
                ))}
              </div>
            </details>
          </>
        )}
      </section>
    </PageShell>
  );
}
