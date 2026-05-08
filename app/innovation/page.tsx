import { CurrentMissionSection } from '@/components/innovation/CurrentMissionSection';
import { DiscoveryCandidatesSection } from '@/components/innovation/DiscoveryCandidatesSection';
import { DiscoveryGapSection } from '@/components/innovation/DiscoveryGapSection';
import { InnovationCard } from '@/components/innovation/InnovationCard';
import { ProgressBar } from '@/components/innovation/ProgressBar';
import { Navbar } from '@/components/navbar';
import { PageHeader, PageShell } from '@/components/ui/mission';
import { getInnovationDashboardPageData } from '@/lib/innovation/service';

const TARGET_INNOVATIONS = 10;

export default async function InnovationPage() {
  const { innovations, currentMission, discoveryCandidates, discoveryGap, nextDiscoveryAction } = await getInnovationDashboardPageData(TARGET_INNOVATIONS);

  return (
    <PageShell>
      <Navbar />
      <section className="page-container space-y-8">
        <PageHeader
          kicker="Innovation Lab"
          title="Founder Build Pipeline"
          description="ชัดเจนว่าอะไรคือ mission ตอนนี้ อะไรพร้อมเริ่ม และอะไรต้องเร่งทดลองต่อ"
        />
        <CurrentMissionSection mission={currentMission} />
        <ProgressBar current={innovations.length} total={TARGET_INNOVATIONS} />
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
          <section className="grid gap-5 md:grid-cols-2">
            {innovations.map((innovation) => (
              <InnovationCard key={innovation.id} innovation={innovation} isCurrent={currentMission?.id === innovation.id} />
            ))}
          </section>
        )}
      </section>
    </PageShell>
  );
}
