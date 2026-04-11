import Link from 'next/link';

import { Navbar } from '@/components/navbar';
import { PageHeader, PageShell, PremiumCard, StatusBadge } from '@/components/ui/mission';
import { SMV_CHART_LABELS } from '@/lib/smv/definitions';
import { APPEARANCE_CATEGORY_KEYS } from '@/lib/smv/appearance-config';
import { getSmvUnifiedMissionCardData } from '@/lib/dashboard/unified-mission';
import { getAppearanceDetailData, getPowerLevelLabel, getSmvOverviewData } from '@/lib/smv/service';

type OverviewDimension = Awaited<ReturnType<typeof getSmvOverviewData>>['dimensions'][number];

function Radar({ items }: { items: OverviewDimension[] }) {
  const size = 420;
  const center = size / 2;
  const radius = 148;
  const getPoint = (score: number, index: number) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / items.length;
    const r = radius * (score / 100);
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)] as const;
  };
  const areaPoints = items.map((item, index) => getPoint(item.score, index)).map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-[330px] w-[330px] md:h-[390px] md:w-[390px]">
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
        return (
          <g key={item.dimension.id}>
            <line x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="rgba(148,163,184,0.25)" strokeWidth={1} />
            <text x={center + (radius + 32) * Math.cos(angle)} y={center + (radius + 32) * Math.sin(angle)} fill="rgba(224,242,254,0.95)" fontSize="12" textAnchor="middle" dominantBaseline="middle">
              {SMV_CHART_LABELS[item.dimension.key as keyof typeof SMV_CHART_LABELS] ?? item.dimension.label}
            </text>
          </g>
        );
      })}
      <polygon points={areaPoints} fill="rgba(34,211,238,0.16)" stroke="rgba(103,232,249,0.85)" strokeWidth={2.5} />
    </svg>
  );
}

export default async function SmvOverviewPage() {
  const data = await getSmvOverviewData();
  const strongest = data.strongest[0];
  const weakest = data.weakest[0];
  const missionCard = getSmvUnifiedMissionCardData(data);
  const appearanceDetail = await getAppearanceDetailData();

  return (
    <PageShell className="smv-static">
      <Navbar />
      <section className="page-container space-y-5">
        <PageHeader kicker="SMV Mission Control" title="Elite SMV System" description={`${missionCard.focusLabel}: ${missionCard.primaryText}`} />

        <section className="grid gap-3 md:grid-cols-3">
          <PremiumCard><p className="text-xs text-slate-400">Current SMV Score</p><p className="mt-1 text-4xl font-semibold text-cyan-100">{data.averageScore}</p></PremiumCard>
          <PremiumCard><p className="text-xs text-slate-400">Strongest Dimension</p><p className="mt-1 text-lg font-semibold text-white">{strongest?.dimension.label ?? '-'}</p></PremiumCard>
          <PremiumCard><p className="text-xs text-slate-400">Need Upgrade First</p><p className="mt-1 text-lg font-semibold text-white">{weakest?.dimension.label ?? '-'}</p></PremiumCard>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <PremiumCard className="flex justify-center"><Radar items={data.dimensions} /></PremiumCard>
          <PremiumCard className="space-y-3">
            <h2 className="section-title">พลังหลัก 4 ด้าน</h2>
            {data.dimensions.map((item) => {
              const isBest = strongest?.dimension.id === item.dimension.id;
              const isWeak = weakest?.dimension.id === item.dimension.id;
              const isAppearance = item.dimension.key === 'look' && appearanceDetail;
              return (
                <div key={item.dimension.id} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between gap-2"><p className="font-semibold text-white">{item.dimension.label}</p>{isBest ? <StatusBadge label="จุดแข็ง" tone="success" /> : isWeak ? <StatusBadge label="เร่งพัฒนา" tone="warning" /> : null}</div>
                  <p className="mt-1 text-sm text-cyan-100">{item.score.toFixed(0)} / 100 · {getPowerLevelLabel(item.score)}</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-cyan-300" style={{ width: `${item.score}%` }} /></div>
                  {isAppearance ? <p className="mt-2 text-xs text-slate-300">{APPEARANCE_CATEGORY_KEYS.length} หมวด appearance progression</p> : <p className="mt-2 text-xs text-slate-300">{item.explanation}</p>}
                  <Link href={item.dimension.key === 'look' ? '/smv/appearance' : `/smv/${item.dimension.key}`} className="theme-button-secondary mt-3">ดูรายละเอียด</Link>
                </div>
              );
            })}
          </PremiumCard>
        </section>
      </section>
    </PageShell>
  );
}
