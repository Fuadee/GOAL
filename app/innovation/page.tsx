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
    return 'ไม่พบวันที่สิ้นสุด';
  }

  return `สิ้นสุดเมื่อ ${new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))}`;
}

export default async function InnovationPage() {
  const { innovations, currentMission, discoveryCandidates, discoveryGap } = await getInnovationDashboardPageData(TARGET_INNOVATIONS);
  const activeInnovations = innovations.filter((innovation) => innovation.is_active && !['completed', 'terminated'].includes(deriveInnovationState(innovation)));
  const completedInnovations = innovations.filter((innovation) => deriveInnovationState(innovation) === 'completed');
  const missionHistory = innovations.filter((innovation) => deriveInnovationState(innovation) === 'terminated');

  return (
    <PageShell>
      <Navbar />
      <section className="page-container mx-auto max-w-5xl space-y-5 sm:space-y-6">
        {innovations.length === 0 ? (
          <>
            <section className="premium-card border-dashed p-10 text-center"><p className="text-[color:var(--text-secondary)]">ยังไม่มี Innovation เริ่มบันทึกไอเดียแรกเพื่อสร้างอนาคตของคุณ</p></section>
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
                <h2 className={innovationUi.sectionTitle}>ภารกิจปัจจุบัน</h2>
                <p className={innovationUi.sectionSubtitle}>งานสำคัญที่สุดที่กำลังลงมือทำตอนนี้</p>
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
                <h2 className={innovationUi.sectionTitle}>ประวัติภารกิจ</h2>
                <p className={innovationUi.sectionSubtitle}>ภารกิจที่ยุติแล้วยังเก็บไว้ให้กลับมาตรวจทานได้</p>
              </div>
              <div className="grid gap-2">
                {missionHistory.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">ยังไม่มีประวัติภารกิจที่ยุติ</div>
                ) : (
                  missionHistory.map((innovation) => (
                    <article key={innovation.id} className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <h3 className="text-sm font-semibold text-slate-950">{innovation.title}</h3>
                          <p className="text-xs text-slate-600">{formatEndedDate(innovation.ended_at)}</p>
                          <p className="text-xs text-slate-500">ความคืบหน้า {innovation.progressPercent}% · {innovation.completedStepCount}/{innovation.stepTotal} ขั้นตอน</p>
                        </div>
                        <span className="inline-flex w-fit rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">ยุติแล้ว ไม่สำเร็จ</span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <details className="rounded-[22px] border border-slate-200/80 bg-white/80 p-4 text-slate-600 shadow-sm">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">ภารกิจที่สำเร็จ ({completedInnovations.length})</summary>
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
