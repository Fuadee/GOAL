import { MomentumItem } from '@/lib/dashboard/types';

type MomentumSectionProps = {
  items: MomentumItem[];
};

const trendStyle = {
  improving: {
    icon: '↑',
    label: 'improving',
    className: 'text-emerald-300'
  },
  stable: {
    icon: '→',
    label: 'stable',
    className: 'text-slate-300'
  },
  declining: {
    icon: '↓',
    label: 'declining',
    className: 'text-rose-300'
  }
} as const;

export function MomentumSection({ items }: MomentumSectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
      <div>
        <h2 className="text-2xl font-semibold text-white">Momentum</h2>
        <p className="text-sm text-slate-400">ดูว่าแต่ละเป้าหมายกำลังดีขึ้น แย่ลง หรือคงที่</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const trend = trendStyle[item.trend];
          const changePrefix = item.change > 0 ? '+' : '';

          return (
            <article
              key={item.moduleKey}
              className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 sm:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))] sm:items-center"
            >
              <p className="font-medium text-white">{item.moduleName}</p>
              <p className="text-sm text-slate-300">Current: {item.currentScore}%</p>
              <p className="text-sm text-slate-300">Previous: {item.previousScore}%</p>
              <p className="text-sm text-slate-200">Change: {changePrefix}{item.change}%</p>
              <p className={`text-sm font-medium uppercase tracking-wide ${trend.className}`}>
                {trend.icon} {trend.label}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
