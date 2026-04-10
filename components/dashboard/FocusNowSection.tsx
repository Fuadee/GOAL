import { FocusItem } from '@/lib/dashboard/types';

type FocusNowSectionProps = {
  items: FocusItem[];
};

const statusStyles: Record<FocusItem['status'], string> = {
  'On Track': 'border-green-400/50 bg-green-500/10 text-green-300',
  'At Risk': 'border-amber-400/50 bg-amber-500/10 text-amber-200',
  Critical: 'border-red-400/60 bg-red-500/10 text-red-300'
};

export function FocusNowSection({ items }: FocusNowSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="mission-label">ACTIVE MISSIONS</p>
        <h2 className="section-title">PRIMARY TARGETS</h2>
        <p className="caption-text mt-1">โฟกัสภารกิจสำคัญก่อน เพื่อยกระดับคะแนนภาพรวมทั้งระบบ</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {items.slice(0, 3).map((item) => (
          <article key={item.id} className="mission-card p-5">
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3">
                <h3 className="card-title">{item.title}</h3>
                <span className={`rounded-full border px-3 py-1 text-xs ${statusStyles[item.status]}`}>{item.status}</span>
              </div>
              <p className="body-text mt-3">{item.reason}</p>
              <p className="mt-4 text-sm font-semibold text-cyan-200">MISSION TARGET: {item.target}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
