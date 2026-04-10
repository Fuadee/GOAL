'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';

import { SMV_AXIS_KEYS, SMV_AXIS_LABELS, type SmvAxisKey, type SmvScores } from '@/lib/smv/constants';

type SmvEditScoresModalProps = {
  isOpen: boolean;
  isSaving: boolean;
  initialScores: SmvScores;
  initialReflection: string;
  errorMessage: string | null;
  onClose: () => void;
  onSave: (nextScores: SmvScores, reflection: string) => Promise<void>;
};

const clampScore = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
};

export function SmvEditScoresModal({
  isOpen,
  isSaving,
  initialScores,
  initialReflection,
  errorMessage,
  onClose,
  onSave
}: SmvEditScoresModalProps) {
  const [draftScores, setDraftScores] = useState<SmvScores>(initialScores);
  const [draftReflection, setDraftReflection] = useState(initialReflection);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraftScores(initialScores);
    setDraftReflection(initialReflection);
  }, [initialReflection, initialScores, isOpen]);

  const hasChanges = useMemo(() => {
    const scoreChanged = SMV_AXIS_KEYS.some((axisKey) => draftScores[axisKey] !== initialScores[axisKey]);
    return scoreChanged || draftReflection !== initialReflection;
  }, [draftReflection, draftScores, initialReflection, initialScores]);

  if (!isOpen) {
    return null;
  }

  const handleScoreChange = (axis: SmvAxisKey, rawValue: string) => {
    const parsed = Number(rawValue);
    const safeValue = Number.isNaN(parsed) ? draftScores[axis] : clampScore(parsed);

    setDraftScores((prev) => ({
      ...prev,
      [axis]: safeValue
    }));
  };

  const handleNumberBlur = (axis: SmvAxisKey, event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(event.target.value);
    const safeValue = Number.isNaN(parsed) ? 0 : clampScore(parsed);

    setDraftScores((prev) => ({
      ...prev,
      [axis]: safeValue
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        onClick={onClose}
        disabled={isSaving}
      />

      <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/15 bg-slate-900/95 p-5 shadow-2xl shadow-cyan-500/10 md:p-7">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white">Edit SMV Scores</h2>
          <p className="mt-1 text-sm text-slate-300">ปรับคะแนนพลังชีวิตทั้ง 8 ด้าน</p>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {SMV_AXIS_KEYS.map((axisKey, index) => (
            <div key={axisKey} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-100">{SMV_AXIS_LABELS[axisKey]}</p>
                  <p className="text-xs text-slate-400">{axisKey}</p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  inputMode="numeric"
                  value={draftScores[axisKey]}
                  onChange={(event) => handleScoreChange(axisKey, event.target.value)}
                  onBlur={(event) => handleNumberBlur(axisKey, event)}
                  className="w-20 rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-right text-sm text-white outline-none transition focus:border-cyan-300"
                  disabled={isSaving}
                  autoFocus={index === 0}
                />
              </div>

              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={draftScores[axisKey]}
                onChange={(event) => handleScoreChange(axisKey, event.target.value)}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-cyan-300"
                disabled={isSaving}
              />
            </div>
          ))}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <label htmlFor="smv-reflection" className="text-sm font-medium text-slate-100">
              หมายเหตุ (optional)
            </label>
            <textarea
              id="smv-reflection"
              rows={3}
              value={draftReflection}
              onChange={(event) => setDraftReflection(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300"
              placeholder="บันทึกสั้น ๆ เกี่ยวกับการประเมินครั้งนี้"
              disabled={isSaving}
            />
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          คะแนนนี้เป็นการประเมินตัวเอง ณ ตอนนี้ และสามารถปรับใหม่ได้ภายหลัง
        </p>

        {errorMessage ? <p className="mt-3 text-sm text-rose-300">{errorMessage}</p> : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draftScores, draftReflection)}
            className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
