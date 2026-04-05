import { LayoutFrame } from "@/components/layout-frame";
import { RunLogForm } from "@/components/run-log-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { mockRunLogs } from "@/lib/mock-data";

export default function LogPage() {
  return (
    <LayoutFrame>
      <div className="space-y-6">
        <RunLogForm />

        <Card>
          <CardHeader>
            <CardTitle>ประวัติการวิ่งล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRunLogs.map((log) => (
                <div key={log.id} className="rounded-lg border border-border p-3">
                  <p className="font-medium">
                    {log.runDate} · {log.durationMinutes} นาที · {log.distanceKm} km · {log.activityType}
                  </p>
                  <p className="text-sm text-slate-500">
                    mission: {log.missionType ?? "-"} · EXP +{log.xpEarned}
                  </p>
                  <p className="text-sm text-slate-500">
                    effort: {log.effort} {log.notes ? `· ${log.notes}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutFrame>
  );
}
