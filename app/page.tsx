import Link from "next/link";
import { LayoutFrame } from "@/components/layout-frame";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { mockRunLogs, mockRunningProfile } from "@/lib/mock-data";
import {
  canStartLevelTest,
  getCoachingMessage,
  getCurrentMode,
  getDaysSinceLastRun,
  getLevelReadiness,
  getLevelTestTarget,
  getTodayMissionChoices,
  getWeeklyMissionForLevel,
  getWeeklyProgress
} from "@/lib/running/quest";
import { cn } from "@/lib/utils";

function ProgressLine({ label, current, target, unit }: { label: string; current: number; target: number; unit?: string }) {
  const ratio = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-600">{label}</p>
        <p className="font-medium">
          {current} / {target} {unit}
        </p>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-slate-900" style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const daysSinceLastRun = getDaysSinceLastRun(mockRunLogs);
  const mode = getCurrentMode(daysSinceLastRun);
  const weeklyMission = getWeeklyMissionForLevel(mockRunningProfile.currentLevel);
  const weeklyProgress = getWeeklyProgress(mockRunLogs);
  const readiness = getLevelReadiness({ level: mockRunningProfile.currentLevel, weeklyProgress });
  const missionChoices = getTodayMissionChoices({ level: mockRunningProfile.currentLevel, mode });
  const canTest = canStartLevelTest({ level: mockRunningProfile.currentLevel, weeklyProgress });
  const levelTestTarget = getLevelTestTarget(mockRunningProfile.currentLevel);
  const coachingMessage = getCoachingMessage({
    mode,
    readiness: readiness.ready,
    level: mockRunningProfile.currentLevel
  });

  return (
    <LayoutFrame>
      <div className="space-y-6">
        <Card className="border-none bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-2xl">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-white/15 text-white">Level {mockRunningProfile.currentLevel}</Badge>
              <p className="text-sm text-slate-300">Mission: Reach 5K</p>
            </div>
            <CardTitle className="text-3xl">ภารกิจสัปดาห์นี้</CardTitle>
            <p className="text-slate-300">สะสมความพร้อมให้พอ แล้วค่อยปลดล็อกการทดสอบระดับถัดไป</p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <ProgressLine label="EXP" current={weeklyProgress.exp} target={weeklyMission.expTarget} />
            <ProgressLine label="Sessions" current={weeklyProgress.sessions} target={weeklyMission.sessionsTarget} unit="ครั้ง" />
            <ProgressLine label="Distance" current={weeklyProgress.distanceKm} target={weeklyMission.distanceTargetKm} unit="km" />
            <ProgressLine label="Time" current={weeklyProgress.timeMin} target={weeklyMission.timeTargetMin} unit="นาที" />
            <p className="md:col-span-2 rounded-lg bg-white/10 p-3 text-sm">
              {canTest
                ? `พร้อมทดสอบระดับ ${levelTestTarget.targetLevel} แล้ว`
                : `ยังไม่พร้อมทดสอบระดับ ${levelTestTarget.targetLevel} แต่ยังไปต่อได้เสมอ`}
            </p>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Today Choices</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {missionChoices.map((choice) => (
              <Card
                key={choice.type}
                className={cn(
                  "transition",
                  choice.recommended && "border-slate-900 shadow-lg shadow-slate-200"
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{choice.label}</CardTitle>
                    {choice.recommended ? <Badge className="bg-emerald-100 text-emerald-700">แนะนำ</Badge> : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>เวลา: {choice.durationRangeMin[0]}–{choice.durationRangeMin[1]} นาที</p>
                  <p>ระยะ: {choice.distanceRangeKm[0].toFixed(1)}–{choice.distanceRangeKm[1].toFixed(1)} km</p>
                  <p>ทำครบได้: {choice.expectedExp} EXP</p>
                  <p className="text-slate-500">เหมาะกับโหมด: {choice.suitableModes.join(", ")}</p>
                  <Button className="mt-2 w-full">เริ่มภารกิจนี้</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Readiness to Level Up</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {readiness.requirements.map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                  <p>{item.label}</p>
                  <p className={item.passed ? "font-semibold text-emerald-600" : "font-medium text-amber-700"}>
                    {item.current}/{item.target} {item.unit} {item.passed ? "✓" : "•"}
                  </p>
                </div>
              ))}
              {!readiness.ready ? (
                <p className="rounded-md bg-amber-50 p-3 text-amber-800">
                  ยังขาด: {readiness.missing.map((item) => `${item.remaining} ${item.unit || item.label}`).join(" · ")}
                </p>
              ) : (
                <p className="rounded-md bg-emerald-50 p-3 text-emerald-700">ครบทุกเงื่อนไข พร้อมสอบได้เลย</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Level Test CTA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">{coachingMessage}</p>
              <p className="text-sm text-slate-600">
                เป้าทดสอบถัดไป: Level {levelTestTarget.targetLevel} ({levelTestTarget.distanceKm} km)
              </p>
              {canTest ? (
                <Link href="/test">
                  <Button className="w-full">เริ่มทดสอบ Level</Button>
                </Link>
              ) : (
                <Button className="w-full" disabled>
                  ยังไม่พร้อม เพราะต้องสะสมภารกิจเพิ่ม
                </Button>
              )}
              <p className="rounded-md bg-slate-100 p-3 text-sm text-slate-600">
                คุณยังไม่ต้องสอบวันนี้ก็ได้ ถ้ายังไม่พร้อม ระบบจะไม่ลงโทษและไม่รีเซ็ตความคืบหน้า
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutFrame>
  );
}
