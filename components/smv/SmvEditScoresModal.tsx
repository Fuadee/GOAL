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
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        disabled={isSaving}
      />

      <div className="theme-card relative z-10 w-full max-w-3xl p-5 md:p-7">
        <div className="mb-6">
          <h2 className="section-title text-2xl">Edit SMV Scores</h2>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">ปรับคะแนนพลังชีวิตทั้ง 8 ด้าน</p>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {SMV_AXIS_KEYS.map((axisKey, index) => (
            <div key={axisKey} className="surface-elevated p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="label-text text-[color:var(--text-primary)]">{SMV_AXIS_LABELS[axisKey]}</p>
                  <p className="helper-text">{axisKey}</p>
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
                  className="theme-input w-20 py-2 text-right text-sm"
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
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-sky-300"
                disabled={isSaving}
              />
            </div>
          ))}

          <div className="surface-elevated p-4">
            <label htmlFor="smv-reflection" className="label-text text-[color:var(--text-primary)]">
              หมายเหตุ (optional)
            </label>
            <textarea
              id="smv-reflection"
              rows={3}
              value={draftReflection}
              onChange={(event) => setDraftReflection(event.target.value)}
              className="theme-textarea mt-2 text-sm"
              placeholder="บันทึกสั้น ๆ เกี่ยวกับการประเมินครั้งนี้"
              disabled={isSaving}
            />
          </div>
        </div>

        <p className="mt-4 helper-text">
          คะแนนนี้เป็นการประเมินตัวเอง ณ ตอนนี้ และสามารถปรับใหม่ได้ภายหลัง
        </p>

        {errorMessage ? <p className="mt-3 text-sm text-rose-300">{errorMessage}</p> : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="theme-button-secondary rounded-xl disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draftScores, draftReflection)}
            className="theme-button-primary rounded-xl disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
