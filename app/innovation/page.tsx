import { CurrentMissionSection } from '@/components/innovation/CurrentMissionSection';
import { DiscoveryCandidatesSection } from '@/components/innovation/DiscoveryCandidatesSection';
import { DiscoveryGapSection } from '@/components/innovation/DiscoveryGapSection';
import { InnovationCard } from '@/components/innovation/InnovationCard';
import { ProgressBar } from '@/components/innovation/ProgressBar';
import { Navbar } from '@/components/navbar';
import { PageHeader, PageShell } from '@/components/ui/mission';
import { getInnovationDashboardPageData } from '@/lib/innovation/service';
import Link from 'next/link';

const TARGET_INNOVATIONS = 10;

export default async function InnovationPage() {
  const { innovations, currentMission, discoveryCandidates, discoveryGap, nextDiscoveryAction } = await getInnovationDashboardPageData(TARGET_INNOVATIONS);

  return (
    <PageShell>
      <Navbar />
      <section className="page-container space-y-5">
        <PageHeader
          kicker="Innovation Lab"
          title="Founder Build Pipeline"
          description="Daily command center สำหรับจัดลำดับงานนวัตกรรมที่ต้องทำต่อทันที"
          className="space-y-3"
          actions={(
            <Link href="/innovation/discovery/new" className="theme-button-primary px-3 py-2 text-xs">
              + Add Innovation
            </Link>
          )}
        />

        <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
          <div className="space-y-4">
            <CurrentMissionSection mission={currentMission} />
            {innovations.length > 0 ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-100">Active Innovation</h2>
                </div>
                <InnovationCard innovation={innovations[0]} isCurrent={currentMission?.id === innovations[0].id} />
              </section>
            ) : (
              <section className="premium-card border-dashed p-5 text-center">
                <p className="text-sm text-[color:var(--text-secondary)]">No innovation yet. Start building your future.</p>
              </section>
            )}
            <DiscoveryCandidatesSection candidates={discoveryCandidates} />
          </div>

          <aside className="space-y-4">
            <ProgressBar current={innovations.length} total={TARGET_INNOVATIONS} />
            <DiscoveryGapSection
              currentCount={innovations.length}
              goalCount={TARGET_INNOVATIONS}
              gap={discoveryGap}
              candidateCount={discoveryCandidates.length}
              nextAction={nextDiscoveryAction}
            />
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
