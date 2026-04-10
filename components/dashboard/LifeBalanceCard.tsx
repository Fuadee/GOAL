import { BalancePoint } from '@/lib/dashboard/types';

type LifeBalanceCardProps = {
  points: BalancePoint[];
  strongestAreas: string[];
  weakestAreas: string[];
};

const SIZE = 260;
const CENTER = SIZE / 2;
const MAX_RADIUS = 88;

const polarToCartesian = (angle: number, radius: number) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad)
  };
};

export function LifeBalanceCard({ points, strongestAreas, weakestAreas }: LifeBalanceCardProps) {
  const axesCount = points.length;
  const polygonPath = points
    .map((point, index) => {
      const angle = (360 / axesCount) * index;
      const radius = (point.value / 100) * MAX_RADIUS;
      const { x, y } = polarToCartesian(angle, radius);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30 md:p-7">
      <h2 className="text-xl font-semibold text-white">Life Balance Overview</h2>
      <p className="mt-1 text-sm text-slate-400">สมดุลของระบบชีวิตทั้ง 5 แกน ณ ตอนนี้</p>

      <div className="mt-4 flex justify-center">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-[280px] w-full max-w-[280px]">
          {[25, 50, 75, 100].map((level) => {
            const ringPoints = points
              .map((_, index) => {
                const angle = (360 / axesCount) * index;
                const radius = (level / 100) * MAX_RADIUS;
                const { x, y } = polarToCartesian(angle, radius);
                return `${x},${y}`;
              })
              .join(' ');

            return <polygon key={level} points={ringPoints} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />;
          })}

          {points.map((point, index) => {
            const angle = (360 / axesCount) * index;
            const end = polarToCartesian(angle, MAX_RADIUS);
            const label = polarToCartesian(angle, MAX_RADIUS + 22);

            return (
              <g key={point.axis}>
                <line x1={CENTER} y1={CENTER} x2={end.x} y2={end.y} stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
                <text x={label.x} y={label.y} fill="rgba(226,232,240,0.95)" fontSize="11" textAnchor="middle">
                  {point.axis}
                </text>
              </g>
            );
          })}

          <polygon points={polygonPath} fill="rgba(56,189,248,0.35)" stroke="rgba(56,189,248,1)" strokeWidth="2" />
          {points.map((point, index) => {
            const angle = (360 / axesCount) * index;
            const radius = (point.value / 100) * MAX_RADIUS;
            const { x, y } = polarToCartesian(angle, radius);
            return <circle key={`${point.axis}-dot`} cx={x} cy={y} r="3" fill="rgba(125,211,252,1)" />;
          })}
        </svg>
      </div>

      <div className="mt-2 space-y-2 text-sm text-slate-300">
        <p>
          <span className="font-medium text-emerald-300">จุดแข็ง:</span> {strongestAreas.join(', ')}
        </p>
        <p>
          <span className="font-medium text-amber-300">ต้องเร่ง:</span> {weakestAreas.join(', ')}
        </p>
      </div>
    </section>
  );
}
