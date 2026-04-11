import Link from 'next/link';

import { Navbar } from '@/components/navbar';
import { SMV_CHART_LABELS } from '@/lib/smv/definitions';
import { getPowerLevelLabel, getSmvOverviewData } from '@/lib/smv/service';

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

  return (
    <main className="app-shell">
      <Navbar />
      <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-8">
        <header className="rounded-3xl border border-cyan-300/20 bg-gradient-to-r from-slate-950/80 via-slate-900/80 to-cyan-950/40 p-6 md:p-7">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">SMV Mission Control</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">SMV Power Overview</h1>
          <p className="mt-2 text-sm text-slate-300">ภาพรวมพลังหลัก 4 ด้านที่กำหนดแรงดึงดูดและความหนักแน่นของคุณ</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/smv/log" className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200">
              เพิ่มหลักฐาน
            </Link>
            <Link href="/smv/plan" className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
              แผนอัปเกรดพลัง
            </Link>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs text-slate-400">ระดับ SMV ปัจจุบัน</p>
                <p className="mt-1 text-4xl font-semibold text-cyan-100">{data.averageScore}</p>
                <p className="text-xs text-slate-400">คะแนนเฉลี่ยจาก 4 ด้าน</p>
              </div>
              <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-4">
                <p className="text-xs text-emerald-100">พลังเด่นที่สุด</p>
                <p className="mt-1 text-lg font-semibold text-white">{strongest?.dimension.label ?? '-'}</p>
                <p className="text-sm text-emerald-100">{strongest?.score.toFixed(0) ?? 0} / 100</p>
              </div>
              <div className="rounded-2xl border border-amber-200/20 bg-amber-500/10 p-4">
                <p className="text-xs text-amber-100">ด้านที่ต้องเร่งอัป</p>
                <p className="mt-1 text-lg font-semibold text-white">{weakest?.dimension.label ?? '-'}</p>
                <p className="text-sm text-amber-100">{weakest?.score.toFixed(0) ?? 0} / 100</p>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
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

                    <p className="mt-3 text-xs text-slate-300">{item.explanation}</p>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/smv/${item.dimension.key}`} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15">
                        ดูรายละเอียด
                      </Link>
                      <Link href={`/smv/log?dimension=${item.dimension.key}`} className="rounded-full border border-cyan-200/40 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/10">
                        เพิ่มหลักฐาน
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
