import Link from 'next/link';

import { Navbar } from '@/components/navbar';
import { SMV_CHART_LABELS } from '@/lib/smv/definitions';
import { APPEARANCE_CATEGORY_KEYS } from '@/lib/smv/appearance-config';
import { getAppearanceDetailData, getPowerLevelLabel, getSmvOverviewData } from '@/lib/smv/service';

type OverviewDimension = Awaited<ReturnType<typeof getSmvOverviewData>>['dimensions'][number];

function Radar({ items }: { items: OverviewDimension[] }) {
  const size = 420;
  const center = size / 2;
  const radius = 148;

  const getPoint = (score: number, index: number, scale = 1) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / items.length;
    const r = radius * scale * (score / 100);
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)] as const;
  };

  const areaPoints = items.map((item, index) => getPoint(item.score, index)).map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-[390px] w-[390px]">
      {[25, 50, 75, 100].map((ring) => {
        const ringPoints = items
          .map((_, index) => {
            const angle = -Math.PI / 2 + (2 * Math.PI * index) / items.length;
            const r = (ring / 100) * radius;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          })
          .join(' ');

        return <polygon key={ring} points={ringPoints} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth={1.3} />;
      })}

      {items.map((item, index) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * index) / items.length;
        const x2 = center + radius * Math.cos(angle);
        const y2 = center + radius * Math.sin(angle);
        const labelX = center + (radius + 32) * Math.cos(angle);
        const labelY = center + (radius + 32) * Math.sin(angle);

        return (
          <g key={item.dimension.id}>
            <line x1={center} y1={center} x2={x2} y2={y2} stroke="rgba(148,163,184,0.25)" strokeWidth={1} />
            <text
              x={labelX}
              y={labelY}
              fill="rgba(224,242,254,0.95)"
              fontSize="12"
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-medium"
            >
              {SMV_CHART_LABELS[item.dimension.key as keyof typeof SMV_CHART_LABELS] ?? item.dimension.label}
            </text>
          </g>
        );
      })}

      <polygon points={areaPoints} fill="rgba(34,211,238,0.25)" stroke="rgba(103,232,249,0.95)" strokeWidth={3} />
      {items.map((item, index) => {
        const [x, y] = getPoint(item.score, index);
        return <circle key={`${item.dimension.id}-dot`} cx={x} cy={y} r={5} fill="rgba(165,243,252,1)" stroke="rgba(8,47,73,1)" strokeWidth={2} />;
      })}
    </svg>
  );
}

export default async function SmvOverviewPage() {
  const data = await getSmvOverviewData();
  const strongest = data.strongest[0];
  const weakest = data.weakest[0];
  const appearanceDetail = await getAppearanceDetailData();

  return (
    <main className="app-shell">
      <Navbar />
      <section className="mx-auto w-full max-w-7xl space-y-4 px-4 py-5 md:space-y-5 md:px-8 md:py-6">
        <article className="rounded-3xl border border-cyan-300/35 bg-gradient-to-r from-cyan-500/15 via-slate-900/90 to-amber-500/10 p-6 shadow-[0_0_30px_rgba(34,211,238,0.2)] animate-[pulse_3.8s_ease-in-out_infinite]">
          <p className="text-sm font-semibold text-cyan-100">🔥 สิ่งที่ต้องทำตอนนี้</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {weakest ? `คุณควรโฟกัส: ${weakest.dimension.label}` : 'ยังไม่มีมิติที่ต้องโฟกัสตอนนี้'}
          </p>
        </article>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs text-slate-400">Current SMV Score</p>
            <p className="mt-1 text-4xl font-semibold text-cyan-100">{data.averageScore}</p>
            <p className="text-xs text-slate-400">คะแนนเฉลี่ยจาก 4 ด้าน</p>
          </article>
          <article className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-4">
            <p className="text-xs text-emerald-100">Strongest Dimension</p>
            <p className="mt-1 text-lg font-semibold text-white">{strongest?.dimension.label ?? '-'}</p>
            <p className="text-sm text-emerald-100">{strongest?.score.toFixed(0) ?? 0} / 100</p>
          </article>
          <article className="rounded-2xl border border-amber-200/20 bg-amber-500/10 p-4">
            <p className="text-xs text-amber-100">Weakest Dimension</p>
            <p className="mt-1 text-lg font-semibold text-white">{weakest?.dimension.label ?? '-'}</p>
            <p className="text-sm text-amber-100">{weakest?.score.toFixed(0) ?? 0} / 100</p>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex justify-center">
              <Radar items={data.dimensions} />
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
            <h2 className="text-xl font-semibold text-white">พลังหลัก 4 ด้าน</h2>
            <p className="mt-1 text-sm text-slate-300">เห็นทันทีว่าอะไรคือจุดแข็งหลัก และอะไรที่ต้องเร่งยกระดับ</p>

            <div className="mt-4 grid gap-3">
              {data.dimensions.map((item) => {
                const isBest = strongest?.dimension.id === item.dimension.id;
                const isWeak = weakest?.dimension.id === item.dimension.id;
                const isAppearance = item.dimension.key === 'look' && appearanceDetail;

                return (
                  <div
                    key={item.dimension.id}
                    className={`rounded-2xl border p-4 transition ${
                      isBest
                        ? 'border-emerald-300/60 bg-emerald-500/12 shadow-[0_0_24px_rgba(52,211,153,0.2)]'
                        : isWeak
                          ? 'border-amber-200/40 bg-amber-500/10'
                          : 'border-white/10 bg-slate-950/35'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-white">{item.dimension.label}</p>
                      {isBest ? <span className="rounded-full border border-emerald-200/50 bg-emerald-400/20 px-2 py-1 text-[11px] text-emerald-100">จุดแข็งหลัก</span> : null}
                      {isWeak ? <span className="rounded-full border border-amber-200/40 bg-amber-300/15 px-2 py-1 text-[11px] text-amber-100">ต้องเร่งพัฒนา</span> : null}
                    </div>

                    <div className="mt-2 flex items-end justify-between">
                      <p className="text-2xl font-semibold text-cyan-100">{item.score.toFixed(0)} / 100</p>
                      <p className="text-xs text-slate-300">ระดับพลัง: {getPowerLevelLabel(item.score)}</p>
                    </div>

                    <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
                      <div className={`h-2 rounded-full ${isBest ? 'bg-emerald-300' : isWeak ? 'bg-amber-200' : 'bg-cyan-300'}`} style={{ width: `${item.score}%` }} />
                    </div>

                    {isAppearance ? (
                      <>
                        <p className="mt-3 text-xs text-cyan-100">คะแนนนี้มาจากระบบอัปเกรดตัวเอง 3 ด้าน (ด่านเท่านั้น)</p>
                        <div className="mt-2 grid gap-2 text-xs text-slate-300">
                          {APPEARANCE_CATEGORY_KEYS.map((key) => {
                            const cat = appearanceDetail.categorySummary.find((entry) => entry.category.key === key);
                            if (!cat) return null;
                            return <p key={key}>{cat.category.titleTh}: {cat.score}/{cat.maxScore} • ด่าน {cat.currentLevel}</p>;
                          })}
                        </div>
                        <p className="mt-2 text-xs text-emerald-100">เด่นสุด: {appearanceDetail.strongest?.category.titleTh ?? '-'} • อ่อนสุด: {appearanceDetail.weakest?.category.titleTh ?? '-'}</p>
                      </>
                    ) : (
                      <p className="mt-3 text-xs text-slate-300">{item.explanation}</p>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Link href={item.dimension.key === 'look' ? '/smv/appearance' : `/smv/${item.dimension.key}`} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15">
                        ดูรายละเอียด
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
