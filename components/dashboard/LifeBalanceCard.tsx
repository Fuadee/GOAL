'use client';

import { motion } from 'framer-motion';
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
    <section className="mission-card p-6 md:p-7">
      <div className="relative z-10">
        <p className="mission-label">SYSTEM ANALYSIS</p>
        <h2 className="section-title">SKILL POWER MATRIX</h2>
        <p className="caption-text mt-1">สมดุลพลังชีวิตทั้ง 5 แกนในระบบบัญชาการของคุณ</p>

        <div className="mt-4 flex justify-center">
          <motion.svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="h-[280px] w-full max-w-[280px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <defs>
              <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(34,211,238,0.45)" />
                <stop offset="100%" stopColor="rgba(139,92,246,0.35)" />
              </linearGradient>
              <filter id="radarGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {[25, 50, 75, 100].map((level) => {
              const ringPoints = points
                .map((_, index) => {
                  const angle = (360 / axesCount) * index;
                  const radius = (level / 100) * MAX_RADIUS;
                  const { x, y } = polarToCartesian(angle, radius);
                  return `${x},${y}`;
                })
                .join(' ');

              return <polygon key={level} points={ringPoints} fill="none" stroke="rgba(148,163,184,0.24)" strokeWidth="1" />;
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

            <motion.polygon
              points={polygonPath}
              fill="url(#radarFill)"
              stroke="rgba(34,211,238,1)"
              strokeWidth="3"
              filter="url(#radarGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            {points.map((point, index) => {
              const angle = (360 / axesCount) * index;
              const radius = (point.value / 100) * MAX_RADIUS;
              const { x, y } = polarToCartesian(angle, radius);
              return (
                <motion.circle
                  key={`${point.axis}-dot`}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="rgba(34,211,238,1)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                />
              );
            })}
          </motion.svg>
        </div>

        <div className="mt-2 space-y-2 text-sm text-slate-300">
          <p>
            <span className="font-semibold text-green-300">จุดแข็ง:</span> {strongestAreas.join(', ')}
          </p>
          <p>
            <span className="font-semibold text-red-300">เร่งด่วน:</span> {weakestAreas.join(', ')}
          </p>
        </div>
      </div>
    </section>
  );
}
