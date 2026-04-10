import { DashboardAlert } from '@/lib/dashboard/types';

type CriticalAlertsSectionProps = {
  alerts: DashboardAlert[];
};

const severityStyles: Record<DashboardAlert['severity'], string> = {
  high: 'border-rose-400/50 bg-rose-500/10 text-rose-200',
  medium: 'border-amber-400/50 bg-amber-500/10 text-amber-200',
  low: 'border-sky-400/40 bg-sky-500/10 text-sky-200'
};

export function CriticalAlertsSection({ alerts }: CriticalAlertsSectionProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Critical Alerts</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {alerts.map((alert) => (
          <article key={alert.id} className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-lg shadow-slate-950/20">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-white">{alert.issueTitle}</h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${severityStyles[alert.severity]}`}>
                Severity: {alert.severity}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{alert.explanation}</p>
            <p className="mt-3 text-sm text-cyan-200">Next action: {alert.nextAction}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
