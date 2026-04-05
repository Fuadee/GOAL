import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import type { RunningMode, TodayPlan } from "@/types/running";
import { cn } from "@/lib/utils";

const MODE_STYLE: Record<RunningMode, string> = {
  normal: "bg-emerald-100 text-emerald-800",
  slip: "bg-amber-100 text-amber-800",
  recovery: "bg-rose-100 text-rose-800"
};

export function TodayPlanCard({
  plan,
  mode,
  levelLabel
}: {
  plan: TodayPlan;
  mode: RunningMode;
  levelLabel: string;
}) {
  return (
    <Card className="border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Today Run Plan</CardTitle>
          <Badge className={cn(MODE_STYLE[mode], "capitalize")}>{mode}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-4xl font-semibold">{plan.durationRange}</p>
        <p className="max-w-2xl text-slate-200">{plan.title}</p>
        <p className="text-sm text-slate-300">โฟกัส: {plan.focus}</p>
        <p className="text-sm text-slate-300">ระดับปัจจุบัน: {levelLabel}</p>

        <div className="flex gap-3">
          <Button className="bg-white text-slate-900 hover:bg-slate-200">เริ่มเลย</Button>
          <Button className="bg-slate-700 hover:bg-slate-600">บันทึกว่าทำแล้ว</Button>
        </div>
      </CardContent>
    </Card>
  );
}
