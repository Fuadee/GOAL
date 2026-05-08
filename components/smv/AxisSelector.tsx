import { SmvDimensionWithScore } from '@/lib/smv/types';

type AxisSelectorProps = {
  dimensions: SmvDimensionWithScore[];
  selectedDimensionId: string;
  strongestIds: Set<string>;
  weakestIds: Set<string>;
  onSelect: (dimensionId: string) => void;
};

export function AxisSelector({ dimensions, selectedDimensionId, strongestIds, weakestIds, onSelect }: AxisSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {dimensions.map((dimension) => {
        const isActive = selectedDimensionId === dimension.id;
        const isStrong = strongestIds.has(dimension.id);
        const isWeak = weakestIds.has(dimension.id);

        return (
          <button
            key={dimension.id}
            type="button"
            onClick={() => onSelect(dimension.id)}
            className={`rounded-full border px-3 py-2 text-xs font-medium transition-all duration-300 md:text-sm ${
              isActive
                ? 'border-cyan-200/70 bg-cyan-300/25 text-cyan-50 shadow-[0_0_0_1px_rgba(103,232,249,0.35),0_0_24px_rgba(6,182,212,0.35)]'
                : isWeak
                  ? 'border-amber-300/35 bg-amber-300/10 text-amber-100 hover:border-amber-200/60 hover:bg-amber-300/15'
                  : isStrong
                    ? 'border-emerald-300/35 bg-emerald-300/10 text-emerald-100 hover:border-emerald-200/60 hover:bg-emerald-300/15'
                    : 'border-white/15 bg-slate-900/60 text-slate-200 hover:border-cyan-300/40 hover:bg-slate-800/90'
            }`}
          >
            {dimension.label}
          </button>
        );
      })}
    </div>
  );
}
