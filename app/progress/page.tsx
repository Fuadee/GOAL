import { LayoutFrame } from "@/components/layout-frame";
import { LevelProgressCard } from "@/components/level-progress-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { mockRunLogs, mockRunningProfile } from "@/lib/mock-data";
import { getWeeklySummary } from "@/lib/running/summary";

export default function ProgressPage() {
  const summary = getWeeklySummary(mockRunLogs);

  return (
    <LayoutFrame>
      <div className="grid grid-cols-[1.2fr_1fr] gap-6">
        <LevelProgressCard currentLevel={mockRunningProfile.currentLevel} />

        <Card>
          <CardHeader>
            <CardTitle>Progress Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>7 วันล่าสุด: {summary.runs7d} ครั้ง</p>
            <p>30 วันล่าสุด: {summary.runs30d} ครั้ง</p>
            <p>เวลาสะสม 7 วัน: {summary.totalMinutes7d} นาที</p>
            <p>แนวโน้ม: {summary.readiness}</p>
            <p className="rounded-md bg-slate-100 p-3 text-slate-600">
              ความสม่ำเสมอเล็ก ๆ คือชัยชนะใหญ่ เป้าหมายคือ “กลับมาได้เรื่อย ๆ” ไม่ใช่ “ห้ามหลุดเลย”
            </p>
          </CardContent>
        </Card>
      </div>
    </LayoutFrame>
  );
}
