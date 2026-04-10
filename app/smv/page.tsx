import { Navbar } from '@/components/navbar';

type AxisScore = {
  axis: string;
  score: number;
};

const SMV_AXES: AxisScore[] = [
  { axis: 'Self-Mastery', score: 82 },
  { axis: 'Money', score: 68 },
  { axis: 'Vitality', score: 75 },
  { axis: 'Vision', score: 88 },
  { axis: 'Innovation', score: 79 },
  { axis: 'Relationships', score: 64 },
  { axis: 'Impact', score: 71 },
  { axis: 'Discipline', score: 86 }
];

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

function buildPolygonPoints(values: AxisScore[], valueScale = 100) {
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
  const totalScore = Math.round(SMV_AXES.reduce((sum, item) => sum + item.score, 0) / SMV_AXES.length);

  const sortedByScore = [...SMV_AXES].sort((a, b) => a.score - b.score);
  const weakestAxes = sortedByScore.slice(0, 2);
  const strongestAxis = sortedByScore[sortedByScore.length - 1];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 md:px-8 md:py-14">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">SMV Analytics</p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">SMV Dashboard</h1>
          <p className="max-w-2xl text-base text-slate-300">
            มุมมองพลังชีวิต 8 ด้านในเรดาร์เดียว เพื่อเห็นจุดแข็ง จุดอ่อน และโฟกัสการพัฒนาให้ชัดขึ้น
          </p>
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
                  const points = SMV_AXES.map((_, index) => {
                    const angle = -Math.PI / 2 + (2 * Math.PI * index) / SMV_AXES.length;
                    const point = polarToCartesian(angle, radius);
                    return `${point.x},${point.y}`;
                  }).join(' ');

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

                {SMV_AXES.map((item, index) => {
                  const angle = -Math.PI / 2 + (2 * Math.PI * index) / SMV_AXES.length;
                  const outerPoint = polarToCartesian(angle, OUTER_RADIUS);
                  const labelPoint = polarToCartesian(angle, OUTER_RADIUS + 20);

                  return (
                    <g key={item.axis}>
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
                        fill="rgb(203 213 225)"
                        fontSize="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {item.axis}
                      </text>
                    </g>
                  );
                })}

                <polygon
                  points={buildPolygonPoints(SMV_AXES)}
                  fill="rgba(56, 189, 248, 0.2)"
                  stroke="rgba(125, 211, 252, 0.95)"
                  strokeWidth="2"
                />

                {SMV_AXES.map((item, index) => {
                  const angle = -Math.PI / 2 + (2 * Math.PI * index) / SMV_AXES.length;
                  const radius = (item.score / 100) * OUTER_RADIUS;
                  const point = polarToCartesian(angle, radius);

                  return <circle key={`${item.axis}-point`} cx={point.x} cy={point.y} r="3.5" fill="rgb(125 211 252)" />;
                })}
              </svg>
            </div>
          </article>

          <aside className="space-y-6">
            <article className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100/80">SMV Score</p>
              <p className="mt-3 text-5xl font-semibold text-cyan-100">{totalScore}</p>
              <p className="mt-2 text-sm text-cyan-100/80">Average score across 8 life-force dimensions</p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white">Highlights</h3>
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <div>
                  <p className="text-slate-400">Strongest axis</p>
                  <p className="mt-1 font-medium text-emerald-300">
                    {strongestAxis.axis} ({strongestAxis.score})
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Weakest 2 axes</p>
                  <ul className="mt-1 space-y-1">
                    {weakestAxes.map((axis) => (
                      <li key={axis.axis} className="font-medium text-amber-300">
                        {axis.axis} ({axis.score})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </aside>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SMV_AXES.map((item) => (
            <article key={item.axis} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.axis}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.score}</p>
              <div className="mt-3 h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${item.score}%` }} aria-hidden="true" />
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
