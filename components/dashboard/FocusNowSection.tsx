import { FocusItem } from '@/lib/dashboard/types';

type FocusNowSectionProps = {
  items: FocusItem[];
};

const statusStyles: Record<FocusItem['status'], string> = {
  'On Track': 'border-emerald-300/40 bg-emerald-400/10 text-emerald-200',
  'At Risk': 'border-amber-300/40 bg-amber-400/10 text-amber-200',
  Critical: 'border-rose-300/40 bg-rose-400/10 text-rose-200'
};

export function FocusNowSection({ items }: FocusNowSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-white">Focus Now</h2>
        <p className="text-sm text-slate-400">สิ่งที่ควรโฟกัสตอนนี้ เพื่อให้ภาพรวมทั้งระบบดีขึ้น</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {items.slice(0, 3).map((item) => (
          <article key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <span className={`rounded-full border px-3 py-1 text-xs ${statusStyles[item.status]}`}>{item.status}</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{item.reason}</p>
            <p className="mt-4 text-sm text-cyan-200">Target: {item.target}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
