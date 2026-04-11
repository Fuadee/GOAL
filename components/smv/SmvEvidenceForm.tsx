'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { logSmvEvidenceAction } from '@/app/smv/actions';
import { APPEARANCE_CATEGORY_KEYS } from '@/lib/smv/appearance-config';
import { SmvDimensionRow, SmvMetricRow } from '@/lib/smv/types';

type Props = {
  dimensions: SmvDimensionRow[];
  metricsByDimension: Record<string, SmvMetricRow[]>;
  initialDimensionId?: string;
  initialAppearanceCategory?: string;
};

const APPEARANCE_CATEGORY_LABELS: Record<(typeof APPEARANCE_CATEGORY_KEYS)[number], string> = {
  style: 'การแต่งตัว',
  body: 'การรักษาหุ่น / ร่างกาย',
  grooming: 'การดูแลผิว / Grooming'
};

export function SmvEvidenceForm({ dimensions, metricsByDimension, initialDimensionId, initialAppearanceCategory }: Props) {
  const router = useRouter();
  const [dimensionId, setDimensionId] = useState(initialDimensionId || dimensions[0]?.id || '');
  const [appearanceCategory, setAppearanceCategory] = useState(initialAppearanceCategory ?? '');
  const [message, setMessage] = useState<string>('');
  const [pending, startTransition] = useTransition();

  const selectedDimension = dimensions.find((dimension) => dimension.id === dimensionId);
  const isLookDimension = selectedDimension?.key === 'look';
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
        <label className="text-xs text-slate-300">หัวข้อพลัง</label>
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

      {isLookDimension ? (
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="text-xs text-slate-300">หมวดหลักฐาน</span>
            <select
              name="appearance_category"
              value={appearanceCategory}
              onChange={(event) => setAppearanceCategory(event.target.value)}
              className="mt-1 w-full rounded-lg border border-cyan-300/30 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="">เลือกหมวด</option>
              {APPEARANCE_CATEGORY_KEYS.map((key) => (
                <option key={key} value={key}>{APPEARANCE_CATEGORY_LABELS[key]}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-slate-300">ผูกกับด่านเป้าหมาย (ไม่บังคับ)</span>
            <input type="number" min={1} max={4} name="target_level" className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white" />
          </label>
          <label className="block">
            <span className="text-xs text-slate-300">ประเภทหลักฐาน (ไม่บังคับ)</span>
            <input name="evidence_type" placeholder="photo / routine / treatment" className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white" />
          </label>
        </div>
      ) : null}

      {!isLookDimension ? (
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
      ) : (
        <p className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-xs text-cyan-100">
          หมวดรูปร่างหน้าตา / บุคลิกที่ดี ใช้ระบบด่านโดยตรง คะแนนจะถูกคำนวณจากด่านที่ปลดล็อก ไม่ใช่กรอกตัวเลขเอง
        </p>
      )}

      <label className="block">
        <span className="text-xs text-slate-300">Context</span>
        <input name="context" className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white" />
      </label>

      <label className="block">
        <span className="text-xs text-slate-300">Note</span>
        <textarea name="note" rows={3} className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white" />
      </label>

      <button type="submit" disabled={pending} className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-70">
        บันทึกหลักฐาน + คำนวณคะแนน
      </button>

      {message ? <p className="text-sm text-slate-300">{message}</p> : null}
    </form>
  );
}
