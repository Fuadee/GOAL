import { LayoutFrame } from "@/components/layout-frame";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { mockRunLogs, mockRunningProfile } from "@/lib/mock-data";
import { canStartLevelTest, getLevelReadiness, getLevelTestTarget, getWeeklyProgress } from "@/lib/running/quest";

export default function TestPage() {
  const weeklyProgress = getWeeklyProgress(mockRunLogs);
  const readiness = getLevelReadiness({ level: mockRunningProfile.currentLevel, weeklyProgress });
  const target = getLevelTestTarget(mockRunningProfile.currentLevel);
  const canTest = canStartLevelTest({ level: mockRunningProfile.currentLevel, weeklyProgress });

  return (
    <LayoutFrame>
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Level Test</CardTitle>
              <Badge className={canTest ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                {canTest ? "พร้อมสอบ" : "ยังไม่พร้อม"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-2xl font-semibold">ทดสอบ Level {target.targetLevel}</p>
            <p>เป้าหมาย: วิ่ง/จ๊อกให้ครบ {target.distanceKm} km</p>
            <p className="rounded-md bg-slate-100 p-3">Tips: เริ่ม pace ที่หายใจได้สบาย แล้วค่อยเร่งช่วงท้าย</p>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span>ระยะที่ทำได้จริง (km)</span>
                <input type="number" min={0} step={0.1} className="w-full rounded-md border px-3 py-2" defaultValue={target.distanceKm} />
              </label>
              <label className="space-y-1">
                <span>เวลา (นาที)</span>
                <input type="number" min={1} className="w-full rounded-md border px-3 py-2" defaultValue={15} />
              </label>
            </div>
            <label className="space-y-1 block">
              <span>โน้ต</span>
              <textarea rows={3} className="w-full rounded-md border px-3 py-2" placeholder="วันนี้รู้สึกอย่างไรบ้าง" />
            </label>

            <div className="flex gap-3">
              <Button disabled={!canTest}>บันทึกผล: ผ่านการทดสอบ</Button>
              <Button className="bg-slate-600 hover:bg-slate-500">บันทึกผล: ยังไม่ผ่าน</Button>
            </div>
            <p className="text-slate-600">ถ้ายังไม่ผ่าน Level จะคงเดิม และ progress ทั้งหมดจะไม่หาย</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Readiness ก่อนเริ่มสอบ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {readiness.requirements.map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-md border p-2">
                <p>{item.label}</p>
                <p>{item.current}/{item.target} {item.unit}</p>
              </div>
            ))}
            {canTest ? (
              <p className="rounded-md bg-emerald-50 p-3 text-emerald-700">พร้อมทดสอบระดับถัดไปแล้ว</p>
            ) : (
              <p className="rounded-md bg-amber-50 p-3 text-amber-700">ยังไม่พร้อม เพราะ: {readiness.missing.map((item) => `${item.remaining} ${item.unit || item.label}`).join(" · ")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutFrame>
  );
}
