import { DiscoveryCandidatesSection } from '@/components/innovation/DiscoveryCandidatesSection';
import { DiscoveryGapSection } from '@/components/innovation/DiscoveryGapSection';
import { InnovationCard } from '@/components/innovation/InnovationCard';
import { CurrentMissionSection } from '@/components/innovation/CurrentMissionSection';
import { ProgressBar } from '@/components/innovation/ProgressBar';
import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';
import { getInnovationDashboardPageData } from '@/lib/innovation/service';
import { deriveInnovationState } from '@/lib/innovation/helpers';
import { innovationUi } from '@/components/innovation/uiTokens';
import { MissionRewardSection } from '@/components/innovation/MissionRewardSection';

const TARGET_INNOVATIONS = 10;

function formatEndedDate(value: string | null): string {
  if (!value) {
    return 'Ended date unavailable';
  }

  return `Ended ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))}`;
}

export default async function InnovationPage() {
  const { innovations, currentMission, discoveryCandidates, discoveryGap } = await getInnovationDashboardPageData(TARGET_INNOVATIONS);
  const activeInnovations = innovations.filter((innovation) => innovation.is_active && !['completed', 'terminated'].includes(deriveInnovationState(innovation)));
  const completedInnovations = innovations.filter((innovation) => deriveInnovationState(innovation) === 'completed');
  const missionHistory = innovations.filter((innovation) => deriveInnovationState(innovation) === 'terminated');

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
                <CurrentMissionSection mission={currentMission} />
                <MissionRewardSection mission={currentMission} />
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


            <section className="space-y-2">
              <div>
                <h2 className={innovationUi.sectionTitle}>Mission History</h2>
                <p className={innovationUi.sectionSubtitle}>Soft-archived missions remain available for review.</p>
              </div>
              <div className="grid gap-2">
                {missionHistory.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">ยังไม่มีประวัติภารกิจที่ยุติ</div>
                ) : (
                  missionHistory.map((innovation) => (
                    <article key={innovation.id} className="rounded-2xl border border-rose-200/70 bg-rose-50/70 p-4 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <h3 className="text-sm font-semibold text-slate-950">{innovation.title}</h3>
                          <p className="text-xs text-slate-600">{formatEndedDate(innovation.ended_at)}</p>
                          <p className="text-xs text-slate-500">Progress {innovation.progressPercent}% · {innovation.completedStepCount}/{innovation.stepTotal} steps</p>
                        </div>
                        <span className="inline-flex w-fit rounded-full border border-rose-200 bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700">ยุติแล้ว ไม่สำเร็จ</span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

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
