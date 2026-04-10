'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { logSmvEvidenceAction } from '@/app/smv/actions';
import { SmvDimensionRow, SmvMetricRow } from '@/lib/smv/types';

type Props = {
  dimensions: SmvDimensionRow[];
  metricsByDimension: Record<string, SmvMetricRow[]>;
  initialDimensionId?: string;
};

export function SmvEvidenceForm({ dimensions, metricsByDimension, initialDimensionId }: Props) {
  const router = useRouter();
  const [dimensionId, setDimensionId] = useState(initialDimensionId || dimensions[0]?.id || '');
  const [message, setMessage] = useState<string>('');
  const [pending, startTransition] = useTransition();

  const metrics = useMemo(() => metricsByDimension[dimensionId] ?? [], [dimensionId, metricsByDimension]);

  return (
    <form
      action={(formData) => {
        setMessage('');
        startTransition(async () => {
          const result = await logSmvEvidenceAction(formData);
          setMessage(result.message);
          if (result.success) router.refresh();
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="text-xs text-slate-300">Dimension</label>
        <select
          name="dimension_id"
          value={dimensionId}
          onChange={(event) => setDimensionId(event.target.value)}
          className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
        >
          {dimensions.map((dimension) => (
            <option key={dimension.id} value={dimension.id}>{dimension.label}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {metrics.map((metric) => (
          <label key={metric.id} className="block">
            <span className="text-xs text-slate-300">{metric.label}</span>
            <input
              type="number"
              step="0.01"
              name={`metric_${metric.id}`}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
              placeholder="Enter evidence value"
            />
          </label>
        ))}
      </div>

      <label className="block">
        <span className="text-xs text-slate-300">Context</span>
        <input name="context" className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white" />
      </label>

      <label className="block">
        <span className="text-xs text-slate-300">Note</span>
        <textarea name="note" rows={3} className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white" />
      </label>

      <button type="submit" disabled={pending} className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-70">
        Save evidence + recalculate
      </button>

      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </form>
  );
}
