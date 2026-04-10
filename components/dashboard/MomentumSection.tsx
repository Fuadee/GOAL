import { MomentumItem } from '@/lib/dashboard/types';

type MomentumSectionProps = {
  items: MomentumItem[];
};

const trendStyle = {
  improving: {
    icon: '↑',
    label: 'boosting',
    className: 'text-green-300'
  },
  stable: {
    icon: '→',
    label: 'stable',
    className: 'text-slate-300'
  },
  declining: {
    icon: '↓',
    label: 'critical',
    className: 'text-red-300'
  }
} as const;

export function MomentumSection({ items }: MomentumSectionProps) {
  return (
    <section className="mission-card space-y-4 p-6">
      <div className="relative z-10">
        <p className="mission-label">SYSTEM ANALYSIS</p>
        <h2 className="section-title">MOMENTUM TRACKING</h2>
        <p className="caption-text">จับสัญญาณว่าภารกิจไหนกำลังเร่งขึ้นหรือเริ่มสูญเสียแรงส่ง</p>
      </div>

      <div className="relative z-10 space-y-3">
        {items.map((item) => {
          const trend = trendStyle[item.trend];
          const changePrefix = item.change > 0 ? '+' : '';

          return (
            <article
              key={item.moduleKey}
              className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4 transition hover:border-cyan-400/40 sm:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))] sm:items-center"
            >
              <p className="font-semibold text-white">{item.moduleName}</p>
              <p className="text-sm text-slate-300">Current: {item.currentScore}%</p>
              <p className="text-sm text-slate-300">Previous: {item.previousScore}%</p>
              <p className="text-sm font-semibold text-cyan-200">Change: {changePrefix}{item.change}%</p>
              <p className={`text-sm font-semibold uppercase tracking-wide ${trend.className}`}>
                {trend.icon} {trend.label}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
