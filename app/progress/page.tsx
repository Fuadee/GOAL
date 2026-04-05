import { LayoutFrame } from "@/components/layout-frame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { demoStates, mockLevelTests, mockRunLogs, mockRunningProfile } from "@/lib/mock-data";
import { getLevelReadiness, getTestResult, getWeeklyMissionForLevel, getWeeklyProgress } from "@/lib/running/quest";

const LEVEL_LABELS = ["Level 1 · 0.5K", "Level 2 · 1K", "Level 3 · 2K", "Level 4 · 3K", "Level 5 · 5K"];

export default function ProgressPage() {
  const weeklyProgress = getWeeklyProgress(mockRunLogs);
  const mission = getWeeklyMissionForLevel(mockRunningProfile.currentLevel);
  const readiness = getLevelReadiness({ level: mockRunningProfile.currentLevel, weeklyProgress });
  const passedState = getTestResult(demoStates.testPassed);
  const failedState = getTestResult(demoStates.testFailed);

  return (
    <LayoutFrame>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Current Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="text-3xl font-semibold">{mockRunningProfile.currentLevel}</p>
              <p className="text-slate-500">{LEVEL_LABELS[mockRunningProfile.currentLevel - 1]}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Trend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>Sessions: {weeklyProgress.sessions}/{mission.sessionsTarget}</p>
              <p>Distance: {weeklyProgress.distanceKm}/{mission.distanceTargetKm} km</p>
              <p>Time: {weeklyProgress.timeMin}/{mission.timeTargetMin} นาที</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Readiness Status</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {readiness.ready ? (
                <p className="rounded-md bg-emerald-50 p-3 text-emerald-700">พร้อมทดสอบระดับถัดไป</p>
              ) : (
                <p className="rounded-md bg-amber-50 p-3 text-amber-700">ยังขาดอีก {readiness.missing.length} เงื่อนไข</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Unlocked Levels</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-5">
            {LEVEL_LABELS.map((level, index) => (
              <div
                key={level}
                className={`rounded-lg border p-3 text-sm ${
                  index + 1 <= mockRunningProfile.currentLevel
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-border bg-white"
                }`}
              >
                {level}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Tests History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {mockLevelTests.map((test) => (
              <div key={test.id} className="rounded-lg border p-3">
                <p className="font-medium">
                  {test.createdAt} · Level {test.targetLevel} Test · {test.testDistanceKm} km
                </p>
                <p className={test.passed ? "text-emerald-700" : "text-amber-700"}>
                  {test.passed ? "ผ่าน" : "ยังไม่ผ่าน"} {test.notes ? `· ${test.notes}` : ""}
                </p>
              </div>
            ))}
            <div className="grid gap-3 md:grid-cols-2">
              <p className="rounded-md bg-emerald-50 p-3 text-emerald-700">Demo สถานะสอบผ่าน: {passedState.message}</p>
              <p className="rounded-md bg-amber-50 p-3 text-amber-700">Demo สถานะสอบไม่ผ่าน: {failedState.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutFrame>
  );
}
