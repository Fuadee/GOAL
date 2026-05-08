import { useMemo } from 'react';

import { SmvDimensionWithScore } from '@/lib/smv/types';

import { AxisDetailPanel } from './AxisDetailPanel';
import { AxisSelector } from './AxisSelector';

type RadarCardProps = {
  dimensions: SmvDimensionWithScore[];
  selectedDimension: SmvDimensionWithScore | undefined;
  selectedDimensionId: string;
  strongestIds: Set<string>;
  weakestIds: Set<string>;
  onSelectDimension: (dimensionId: string) => void;
  onEditScore: (dimensionId: string) => void;
};

const RADAR_SIZE = 340;
const CENTER = RADAR_SIZE / 2;
const OUTER_RADIUS = 118;
const RINGS = [20, 40, 60, 80, 100];

function polar(angle: number, radius: number) {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle)
  };
}

export function RadarCard({
  dimensions,
  selectedDimension,
  selectedDimensionId,
  strongestIds,
  weakestIds,
  onSelectDimension,
  onEditScore
}: RadarCardProps) {
  const radarPoints = useMemo(() => {
    return dimensions
      .map((dimension, index) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * index) / dimensions.length;
        const radius = (dimension.currentScore / 100) * OUTER_RADIUS;
        const point = polar(angle, radius);
        return `${point.x},${point.y}`;
      })
      .join(' ');
  }, [dimensions]);

  return (
    <article className="mx-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
      <h2 className="text-lg font-semibold text-white">Radar Chart</h2>

      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`} className="mx-auto h-[320px] w-[320px] md:h-[350px] md:w-[350px]">
          {RINGS.map((value) => {
            const radius = (value / 100) * OUTER_RADIUS;
            const ring = dimensions
              .map((_, index) => {
                const angle = -Math.PI / 2 + (2 * Math.PI * index) / dimensions.length;
                const p = polar(angle, radius);
                return `${p.x},${p.y}`;
              })
              .join(' ');
            return <polygon key={value} points={ring} fill="none" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />;
          })}
          {dimensions.map((dimension, index) => {
            const angle = -Math.PI / 2 + (2 * Math.PI * index) / dimensions.length;
            const p = polar(angle, OUTER_RADIUS);
            const l = polar(angle, OUTER_RADIUS + 18);
            return (
              <g key={dimension.id}>
                <line x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
                <text x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" fill="rgb(203 213 225)" fontSize="10">
                  {dimension.label}
                </text>
              </g>
            );
          })}
          <polygon points={radarPoints} fill="rgba(34,211,238,0.2)" stroke="rgba(103,232,249,0.95)" strokeWidth="2" />
        </svg>
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">Axis Breakdown</p>
        <AxisSelector
          dimensions={dimensions}
          selectedDimensionId={selectedDimensionId}
          strongestIds={strongestIds}
          weakestIds={weakestIds}
          onSelect={onSelectDimension}
        />
      </div>

      {selectedDimension ? (
        <div className="mt-4">
          <AxisDetailPanel
            dimension={selectedDimension}
            open
            onViewChecklist={() => onSelectDimension(selectedDimension.id)}
            onEditScore={() => onEditScore(selectedDimension.id)}
          />
        </div>
      ) : null}
    </article>
  );
}
