'use client';

import { useMemo, useState } from 'react';

import { Navbar } from '@/components/navbar';
import { SmvEditScoresModal } from '@/components/smv/SmvEditScoresModal';
import {
  SMV_AXIS_INSIGHTS,
  SMV_AXIS_KEYS,
  SMV_SAMPLE_PROFILE,
  buildSmvDashboardData,
  getAxisTier,
  getSortedAxes,
  type SmvAxisTier,
  type SmvScores
} from '@/lib/smv/constants';

const RADAR_SIZE = 360;
const CENTER = RADAR_SIZE / 2;
const OUTER_RADIUS = 130;
const RING_VALUES = [20, 40, 60, 80, 100];

function polarToCartesian(angle: number, radius: number) {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle)
  };
}

function buildPolygonPoints(values: ReturnType<typeof buildSmvDashboardData>['axes'], valueScale = 100) {
  return values
    .map((item, index) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * index) / values.length;
      const radius = (item.score / valueScale) * OUTER_RADIUS;
      const { x, y } = polarToCartesian(angle, radius);

      return `${x},${y}`;
    })
    .join(' ');
}

export default function SmvPage() {
  const [scores, setScores] = useState<SmvScores>(SMV_SAMPLE_PROFILE);
  const [reflection, setReflection] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'framework' | 'score'>('framework');

  const dashboardData = useMemo(() => buildSmvDashboardData(scores), [scores]);
  const strongestAxisLabels = dashboardData.strongestAxes.map((axis) => axis.label);
  const weakestAxisLabels = dashboardData.weakestAxes.map((axis) => axis.label);
  const weakestInsight = dashboardData.weakestAxes.map((axis) => SMV_AXIS_INSIGHTS[axis.key]).join(' • ');
  const sortedCardAxes = useMemo(() => getSortedAxes(scores, sortMode), [scores, sortMode]);

  const handleSaveScores = async (nextScores: SmvScores, nextReflection: string) => {
    setSaveError(null);
    setIsSaving(true);

    try {
      // Local-first state update (ready to replace with backend service call later)
      await Promise.resolve();
      setScores(nextScores);
      setReflection(nextReflection);
      setIsEditOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save SMV scores. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 md:px-8 md:py-14">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">SMV Analytics</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">SMV Dashboard</h1>
            <p className="max-w-2xl text-base text-slate-300">
              มุมมองพลังชีวิต 8 ด้านในเรดาร์เดียว เพื่อเห็นจุดแข็ง จุดอ่อน และโฟกัสการพัฒนาให้ชัดขึ้น
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSaveError(null);
              setIsEditOpen(true);
            }}
            className="rounded-xl border border-cyan-300/40 bg-cyan-300/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/25"
          >
            Edit Score
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur md:p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Radar Chart (8 Axes)</h2>

            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
                className="mx-auto h-[360px] w-[360px] text-slate-300"
                role="img"
                aria-label="SMV radar chart"
              >
                {RING_VALUES.map((value) => {
                  const radius = (value / 100) * OUTER_RADIUS;
                  const points = dashboardData.axes
                    .map((_, index) => {
                      const angle = -Math.PI / 2 + (2 * Math.PI * index) / SMV_AXIS_KEYS.length;
                      const point = polarToCartesian(angle, radius);
                      return `${point.x},${point.y}`;
                    })
                    .join(' ');

                  return (
                    <polygon
                      key={value}
                      points={points}
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.35)"
                      strokeWidth="1"
                    />
                  );
                })}

                {dashboardData.axes.map((item, index) => {
                  const angle = -Math.PI / 2 + (2 * Math.PI * index) / SMV_AXIS_KEYS.length;
                  const outerPoint = polarToCartesian(angle, OUTER_RADIUS);
                  const labelPoint = polarToCartesian(angle, OUTER_RADIUS + 20);
                  const tier = getAxisTier(item.key, scores);

                  return (
                    <g key={item.key}>
                      <line
                        x1={CENTER}
                        y1={CENTER}
                        x2={outerPoint.x}
                        y2={outerPoint.y}
                        stroke="rgba(148, 163, 184, 0.35)"
                        strokeWidth="1"
                      />
                      <text
                        x={labelPoint.x}
                        y={labelPoint.y}
                        fill={tier === 'weakness' ? 'rgb(253 230 138)' : 'rgb(203 213 225)'}
                        fontSize="10"
                        fontWeight={tier === 'weakness' ? '700' : '500'}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {item.label}
                      </text>
                    </g>
                  );
                })}

                <polygon
                  points={buildPolygonPoints(dashboardData.axes)}
                  fill="rgba(56, 189, 248, 0.2)"
                  stroke="rgba(125, 211, 252, 0.95)"
                  strokeWidth="2"
                />

                {dashboardData.axes.map((item, index) => {
                  const angle = -Math.PI / 2 + (2 * Math.PI * index) / SMV_AXIS_KEYS.length;
                  const radius = (item.score / 100) * OUTER_RADIUS;
                  const point = polarToCartesian(angle, radius);
                  const tier = getAxisTier(item.key, scores);
                  const pointStyleByTier: Record<SmvAxisTier, { fill: string; radius: number }> = {
                    strength: { fill: 'rgb(153 246 228)', radius: 4.8 },
                    weakness: { fill: 'rgb(253 186 116)', radius: 4.3 },
                    balanced: { fill: 'rgb(125 211 252)', radius: 3.5 }
                  };
                  const tierLabel =
                    tier === 'strength' ? 'จุดแข็ง' : tier === 'weakness' ? 'ควรอัป' : 'สมดุล';

                  return (
                    <circle
                      key={`${item.key}-point`}
                      cx={point.x}
                      cy={point.y}
                      r={pointStyleByTier[tier].radius}
                      fill={pointStyleByTier[tier].fill}
                    >
                      <title>{`${item.label} — ${tierLabel} (${item.score})`}</title>
                    </circle>
                  );
                })}
              </svg>
            </div>
          </article>

          <aside className="space-y-6">
            <article className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100/80">SMV Score</p>
              <p className="mt-3 text-5xl font-semibold text-cyan-100">{dashboardData.totalScore}</p>
              <p className="mt-2 text-sm text-cyan-100/80">Average score across 8 life-force dimensions</p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white">Highlights</h3>
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-teal-300/20 bg-teal-300/5 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-200/70">Strongest</p>
                  <p className="mt-1 text-[11px] text-slate-400">ด้านที่ตอนนี้เป็นพลังนำ</p>
                  <p className="mt-2 font-medium text-teal-200">{strongestAxisLabels.join(' • ')}</p>
                </div>
                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">Weakest</p>
                  <p className="mt-1 text-[11px] text-slate-400">ด้านที่ถ้าอัปแล้วภาพรวมจะดีขึ้นเร็ว</p>
                  <ul className="mt-2 space-y-1">
                    {dashboardData.weakestAxes.map((axis) => (
                      <li key={axis.key} className="font-medium text-amber-200">
                        {axis.label} ({axis.score})
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Focus Now</p>
                  <p className="mt-1 text-[11px] text-slate-400">จุดที่ควรลงแรงก่อน</p>
                  <p className="mt-2 font-medium text-cyan-100">
                    ตอนนี้ควรเร่งอัปเกรด {weakestAxisLabels.join(' และ ')} ก่อน
                  </p>
                  <p className="mt-2 text-xs text-cyan-100/75">{weakestInsight}</p>
                </div>
              </div>
            </article>

            {reflection ? (
              <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Reflection</h3>
                <p className="mt-2 text-sm text-slate-200">{reflection}</p>
              </article>
            ) : null}
          </aside>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white">SMV Axis Breakdown</h2>
            <div className="inline-flex rounded-xl border border-white/15 bg-slate-900/70 p-1">
              <button
                type="button"
                onClick={() => setSortMode('framework')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  sortMode === 'framework'
                    ? 'bg-white/10 text-cyan-100'
                    : 'text-slate-300 hover:bg-white/5 hover:text-slate-100'
                }`}
              >
                เรียงตามโครงหลัก
              </button>
              <button
                type="button"
                onClick={() => setSortMode('score')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  sortMode === 'score'
                    ? 'bg-white/10 text-cyan-100'
                    : 'text-slate-300 hover:bg-white/5 hover:text-slate-100'
                }`}
              >
                เรียงตามคะแนน
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {sortedCardAxes.map((item) => {
              const tier = getAxisTier(item.key, scores);
              const isStrength = tier === 'strength';
              const isWeakness = tier === 'weakness';

              return (
                <article
                  key={item.key}
                  className={`rounded-2xl border p-4 backdrop-blur transition ${
                    isStrength
                      ? 'border-teal-300/35 bg-teal-300/[0.07] shadow-[0_0_30px_rgba(45,212,191,0.15)]'
                      : isWeakness
                        ? 'border-amber-300/30 bg-amber-300/[0.06]'
                        : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{item.label}</p>
                    {isStrength ? (
                      <span className="rounded-full border border-teal-200/35 bg-teal-300/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-100">
                        จุดแข็ง
                      </span>
                    ) : null}
                    {isWeakness ? (
                      <span className="rounded-full border border-amber-200/35 bg-amber-300/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                        ควรอัป
                      </span>
                    ) : null}
                  </div>
                  <p className={`mt-2 text-2xl font-semibold ${isStrength ? 'text-teal-100' : 'text-white'}`}>{item.score}</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-800">
                    <div
                      className={`h-2 rounded-full ${
                        isStrength ? 'bg-teal-300' : isWeakness ? 'bg-amber-300' : 'bg-cyan-300'
                      }`}
                      style={{ width: `${item.score}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  {isWeakness ? (
                    <p className="mt-3 text-xs leading-relaxed text-amber-100/80">{SMV_AXIS_INSIGHTS[item.key]}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      </section>

      <SmvEditScoresModal
        isOpen={isEditOpen}
        isSaving={isSaving}
        initialScores={scores}
        initialReflection={reflection}
        errorMessage={saveError}
        onClose={() => {
          if (isSaving) {
            return;
          }
          setSaveError(null);
          setIsEditOpen(false);
        }}
        onSave={handleSaveScores}
      />
    </main>
  );
}
