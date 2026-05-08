import { SmvDimensionWithScore } from '@/lib/smv/types';

type AxisDetailPanelProps = {
  dimension: SmvDimensionWithScore;
  open: boolean;
  onViewChecklist: () => void;
  onEditScore: () => void;
};

function trendMark(trend: SmvDimensionWithScore['trend']) {
  if (trend === 'up') return '↗';
  if (trend === 'down') return '↘';
  return '→';
}

export function AxisDetailPanel({ dimension, open, onViewChecklist, onEditScore }: AxisDetailPanelProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[#DDE3D5]/30 bg-[#F6F7F4]/70 transition-all duration-300 ${
        open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="space-y-4 p-4 md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#64748B]/70">Selected Axis</p>
            <h3 className="mt-1 text-base font-semibold text-[#1E293B] md:text-lg">{dimension.label}</h3>
            <p className="mt-1 text-xs text-[#64748B]">Trend {trendMark(dimension.trend)}</p>
          </div>
          <p className="text-2xl font-semibold text-[#334155]">{dimension.currentScore}</p>
        </div>

        <div className="h-2 rounded-full bg-[#EEF1EA]">
          <div className="h-full rounded-full bg-[#334155] transition-all duration-300" style={{ width: `${dimension.currentScore}%` }} />
        </div>

        <p className="text-xs text-[#64748B] md:text-sm">
          Today {dimension.todayCompletedCount} • Week {dimension.weeklyCompletedCount} • Streak {dimension.streakDays}d
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-[#DDE3D5] px-3 py-1.5 text-xs text-[#1E293B] transition hover:bg-white/10"
            onClick={onViewChecklist}
          >
            View Checklist
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#DDE3D5]/40 px-3 py-1.5 text-xs text-[#334155] transition hover:bg-[#334155]/20"
            onClick={onEditScore}
          >
            Edit Score
          </button>
        </div>
      </div>
    </div>
  );
}
