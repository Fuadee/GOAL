'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { completeSmvChecklistItemAction, manuallyAdjustSmvScoreAction } from '@/app/smv/actions';
import { SmvDashboardData, SmvDimensionWithScore, SmvScoreEventType } from '@/lib/smv/types';

type SmvDashboardClientProps = {
  data: SmvDashboardData;
};

const RADAR_SIZE = 340;
const CENTER = RADAR_SIZE / 2;
const OUTER_RADIUS = 118;
const RINGS = [20, 40, 60, 80, 100];

function trendMark(trend: SmvDimensionWithScore['trend']) {
  if (trend === 'up') return '↗';
  if (trend === 'down') return '↘';
  return '→';
}

function polar(angle: number, radius: number) {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle)
  };
}

export function SmvDashboardClient({ data }: SmvDashboardClientProps) {
  const router = useRouter();
  const [selectedDimensionId, setSelectedDimensionId] = useState<string>(data.dimensions[0]?.id ?? '');
  const [manualEditDimensionId, setManualEditDimensionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [historyFilter, setHistoryFilter] = useState<'all' | SmvScoreEventType>('all');

  const dimensions = data.dimensions;
  const selectedDimension = dimensions.find((dimension) => dimension.id === selectedDimensionId) ?? dimensions[0];
  const strongestIds = new Set(data.highlights.strongestTwo.map((dimension) => dimension.id));
  const weakestIds = new Set(data.highlights.weakestTwo.map((dimension) => dimension.id));

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

  const checklistItems = selectedDimension ? data.checklistItemsByDimension[selectedDimension.id] ?? [] : [];
  const recentLogs = selectedDimension ? data.recentLogsByDimension[selectedDimension.id] ?? [] : [];

  const filteredHistory = data.selectedDimensionHistory.filter((event) => {
    if (historyFilter === 'all') return true;
    return event.event_type === historyFilter;
  });

  const submitChecklist = (formData: FormData) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await completeSmvChecklistItemAction(formData);
      setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
      if (result.success) {
        router.refresh();
      }
    });
  };

  const submitManual = (formData: FormData) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await manuallyAdjustSmvScoreAction(formData);
      setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
      if (result.success) {
        setManualEditDimensionId(null);
        router.refresh();
      }
    });
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 md:px-8 md:py-12">
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">SMV Score</p>
          <p className="mt-3 text-5xl font-semibold text-cyan-100">{data.highlights.averageScore}</p>
          <p className="mt-2 text-sm text-slate-300">Average across all 8 dimensions</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">Strongest</p>
              <p className="mt-1 font-medium text-emerald-100">{data.highlights.strongestDimension?.label ?? '-'}</p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-100/80">Weakest</p>
              <p className="mt-1 font-medium text-amber-100">{data.highlights.weakestDimension?.label ?? '-'}</p>
            </div>
          </div>
          <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-200">
            {data.highlights.focusNowMessage}
          </p>
          <p className="mt-2 text-xs text-slate-400">{data.highlights.aiRecommendationPlaceholder}</p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Checklist Activity</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>Today: <span className="font-semibold text-cyan-100">{data.activity.todayCompletedCount}</span></p>
            <p>This week: <span className="font-semibold text-cyan-100">{data.activity.weeklyCompletedCount}</span></p>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-3 text-lg font-semibold text-white">Radar Chart</h2>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`} className="mx-auto h-[340px] w-[340px]">
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
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">Axis Breakdown</h2>
          <div className="mt-4 space-y-3">
            {dimensions.map((dimension) => {
              const isStrong = strongestIds.has(dimension.id);
              const isWeak = weakestIds.has(dimension.id);

              return (
                <div
                  key={dimension.id}
                  className={`rounded-2xl border p-3 ${
                    isStrong
                      ? 'border-emerald-300/40 bg-emerald-300/10'
                      : isWeak
                        ? 'border-amber-300/40 bg-amber-300/10'
                        : 'border-white/10 bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      className="text-left"
                      onClick={() => setSelectedDimensionId(dimension.id)}
                    >
                      <p className="text-sm font-medium text-white">{dimension.label}</p>
                      <p className="text-xs text-slate-400">Trend {trendMark(dimension.trend)}</p>
                    </button>
                    <p className="text-lg font-semibold text-cyan-100">{dimension.currentScore}</p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-700">
                    <div className="h-full rounded-full bg-cyan-300" style={{ width: `${dimension.currentScore}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-300">Today {dimension.todayCompletedCount} • Week {dimension.weeklyCompletedCount} • Streak {dimension.streakDays}d</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-white/20 px-2 py-1 text-xs text-white hover:bg-white/10"
                      onClick={() => setSelectedDimensionId(dimension.id)}
                    >
                      View Checklist
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-cyan-300/30 px-2 py-1 text-xs text-cyan-100 hover:bg-cyan-300/20"
                      onClick={() => setManualEditDimensionId(dimension.id)}
                    >
                      Edit Score
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold text-white">Checklist • {selectedDimension?.label}</h3>
          <div className="mt-4 space-y-3">
            {checklistItems.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-slate-400">No checklist items yet.</p>
            ) : (
              checklistItems.map((item) => (
                <form key={item.id} action={submitChecklist} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                  <input type="hidden" name="dimension_id" value={selectedDimension?.id ?? ''} />
                  <input type="hidden" name="checklist_item_id" value={item.id} />
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      {item.description ? <p className="text-xs text-slate-400">{item.description}</p> : null}
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        item.score_delta >= 0 ? 'bg-emerald-300/20 text-emerald-100' : 'bg-rose-300/20 text-rose-100'
                      }`}
                    >
                      {item.score_delta > 0 ? `+${item.score_delta}` : item.score_delta}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      name="notes"
                      placeholder="Optional note"
                      className="flex-1 rounded-lg border border-white/15 bg-slate-900/80 px-2 py-1 text-xs text-white"
                    />
                    <button
                      type="submit"
                      disabled={pending}
                      className="rounded-lg bg-cyan-300 px-3 py-1 text-xs font-semibold text-slate-900 disabled:opacity-60"
                    >
                      Complete
                    </button>
                  </div>
                </form>
              ))
            )}
          </div>

          <h4 className="mt-5 text-sm font-semibold text-slate-200">Recent checklist logs</h4>
          <div className="mt-2 space-y-2">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-400">No checklist logs yet.</p>
            ) : (
              recentLogs.map((log) => (
                <p key={log.id} className="text-xs text-slate-300">
                  {new Date(log.completed_at).toLocaleString()} {log.notes ? `• ${log.notes}` : ''}
                </p>
              ))
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Score History</h3>
            <select
              value={historyFilter}
              onChange={(event) => setHistoryFilter(event.target.value as 'all' | SmvScoreEventType)}
              className="rounded-lg border border-white/20 bg-slate-900 px-2 py-1 text-xs text-white"
            >
              <option value="all">All</option>
              <option value="checklist">Checklist</option>
              <option value="manual_adjustment">Manual</option>
            </select>
          </div>
          <div className="mt-3 space-y-2">
            {filteredHistory.length === 0 ? (
              <p className="text-sm text-slate-400">No score events yet.</p>
            ) : (
              filteredHistory.map((event) => (
                <div key={event.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-200">
                  <p className="font-semibold text-white">{event.event_type}</p>
                  <p>
                    {event.score_before} {event.score_delta >= 0 ? `+${event.score_delta}` : event.score_delta} → {event.score_after}
                  </p>
                  {event.reason ? <p className="text-slate-300">Reason: {event.reason}</p> : null}
                  <p className="text-slate-400">{new Date(event.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      {manualEditDimensionId ? (
        <ManualAdjustModal
          dimension={dimensions.find((dimension) => dimension.id === manualEditDimensionId) ?? null}
          pending={pending}
          onClose={() => setManualEditDimensionId(null)}
          onSubmit={submitManual}
        />
      ) : null}

      {feedback ? (
        <p className={`text-sm ${feedback.type === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>{feedback.message}</p>
      ) : null}
    </section>
  );
}

function ManualAdjustModal({
  dimension,
  pending,
  onClose,
  onSubmit
}: {
  dimension: SmvDimensionWithScore | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  if (!dimension) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button type="button" className="absolute inset-0 bg-slate-950/75" onClick={onClose} />
      <form action={onSubmit} className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-5">
        <input type="hidden" name="dimension_id" value={dimension.id} />
        <h4 className="text-lg font-semibold text-white">Edit Score</h4>
        <p className="text-sm text-slate-300">{dimension.label}</p>
        <label className="mt-3 block text-xs text-slate-300">New score (0-100)</label>
        <input
          name="new_score"
          type="number"
          min={0}
          max={100}
          defaultValue={dimension.currentScore}
          className="mt-1 w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white"
        />
        <label className="mt-3 block text-xs text-slate-300">Reason (required)</label>
        <textarea
          name="reason"
          required
          rows={3}
          className="mt-1 w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white"
          placeholder="Why are you calibrating this score?"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-white/20 px-3 py-1 text-sm text-white">
            Cancel
          </button>
          <button type="submit" disabled={pending} className="rounded-lg bg-cyan-300 px-3 py-1 text-sm font-semibold text-slate-900">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
