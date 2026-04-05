import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

interface StatusSummaryCardProps {
  lastRunLabel: string;
  runs7d: number;
  readiness: string;
  goalProgress: string;
}

export function StatusSummaryCard({
  lastRunLabel,
  runs7d,
  readiness,
  goalProgress
}: StatusSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Last run</dt>
            <dd className="mt-1 text-base font-medium">{lastRunLabel}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Runs in 7 days</dt>
            <dd className="mt-1 text-base font-medium">{runs7d} ครั้ง</dd>
          </div>
          <div>
            <dt className="text-slate-500">Estimated readiness</dt>
            <dd className="mt-1 text-base font-medium">{readiness}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Goal progress</dt>
            <dd className="mt-1 text-base font-medium">{goalProgress}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
