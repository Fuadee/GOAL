import { LayoutFrame } from "@/components/layout-frame";
import { RecoveryMessage } from "@/components/recovery-message";
import { StatusSummaryCard } from "@/components/status-summary-card";
import { TodayPlanCard } from "@/components/today-plan-card";
import { mockRunLogs, mockRunningProfile } from "@/lib/mock-data";
import { LEVELS, getAdjustedLevel } from "@/lib/running/levels";
import { getCurrentMode, getDaysSinceLastRun } from "@/lib/running/mode";
import { formatLastRunDistance, getWeeklySummary, maybePromoteLevel } from "@/lib/running/summary";
import { generateTodayPlan } from "@/lib/running/today-plan";

export default function HomePage() {
  const daysSinceLastRun = getDaysSinceLastRun(mockRunLogs);
  const mode = getCurrentMode(daysSinceLastRun);
  const promotedLevel = maybePromoteLevel(mockRunLogs, mockRunningProfile.currentLevel);
  const adjustedLevel = getAdjustedLevel(promotedLevel, daysSinceLastRun);
  const weekly = getWeeklySummary(mockRunLogs);
  const plan = generateTodayPlan({
    currentLevel: promotedLevel,
    adjustedLevel,
    mode,
    energy: mockRunningProfile.defaultEnergy
  });

  const lastRunLabel = mockRunLogs[0] ? formatLastRunDistance(mockRunLogs[0].runDate) : "ยังไม่มีข้อมูล";
  const levelLabel = LEVELS[adjustedLevel].label;
  const goalProgress = `${adjustedLevel}/4 ระดับ`;

  return (
    <LayoutFrame>
      <div className="space-y-6">
        <TodayPlanCard plan={plan} mode={mode} levelLabel={levelLabel} />

        <div className="grid grid-cols-2 gap-6">
          <StatusSummaryCard
            lastRunLabel={lastRunLabel}
            runs7d={weekly.runs7d}
            readiness={weekly.readiness}
            goalProgress={goalProgress}
          />
          <RecoveryMessage mode={mode} />
        </div>
      </div>
    </LayoutFrame>
  );
}
