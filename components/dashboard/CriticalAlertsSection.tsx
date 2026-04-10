import { DashboardAlert } from '@/lib/dashboard/types';

type CriticalAlertsSectionProps = {
  alerts: DashboardAlert[];
};

const severityStyles: Record<DashboardAlert['severity'], string> = {
  high: 'border-red-400/60 bg-red-500/10 text-red-200',
  medium: 'border-amber-400/50 bg-amber-500/10 text-amber-200',
  low: 'border-cyan-400/50 bg-cyan-500/10 text-cyan-200'
};

export function CriticalAlertsSection({ alerts }: CriticalAlertsSectionProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="mission-label">THREAT MONITOR</p>
        <h2 className="section-title">CRITICAL ALERTS</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {alerts.map((alert) => (
          <article key={alert.id} className="mission-card p-5">
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-white">{alert.issueTitle}</h3>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${severityStyles[alert.severity]}`}>
                  {alert.severity}
                </span>
              </div>
              <p className="body-text mt-3">{alert.explanation}</p>
              <p className="mt-3 text-sm font-semibold text-cyan-200">NEXT ACTION: {alert.nextAction}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
