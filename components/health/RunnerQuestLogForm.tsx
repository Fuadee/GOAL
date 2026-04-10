'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createRunnerRunLogAction } from '@/app/health/actions';
import {
  calculatePaceSecondsPerKm,
  evaluateRunAttempt,
  formatPace,
  getFailureReason,
  parseMinuteSecondDuration
} from '@/lib/running/quest';
import { RunnerDashboardLevel } from '@/lib/running/quest.types';

type RunnerQuestLogFormProps = {
  currentLevel: RunnerDashboardLevel | null;
};

export function RunnerQuestLogForm({ currentLevel }: RunnerQuestLogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState('');
  const [durationInput, setDurationInput] = useState('');
  const [noStop, setNoStop] = useState(false);
  const [isDurationTouched, setIsDurationTouched] = useState(false);

  const durationValidation = useMemo(() => parseMinuteSecondDuration(durationInput), [durationInput]);

  const preview = useMemo(() => {
    if (!currentLevel) return null;

    const distanceValue = Number(distance);
    const runDurationSeconds = durationValidation.durationSeconds;

    if (!Number.isFinite(distanceValue) || distanceValue <= 0 || !runDurationSeconds) {
      return null;
    }

    const pace = calculatePaceSecondsPerKm(runDurationSeconds, distanceValue);
    if (!pace) return null;

    const evaluation = evaluateRunAttempt(currentLevel, {
      run_date: '',
      distance_km: distanceValue,
      duration_seconds: runDurationSeconds,
      pace_seconds_per_km: pace,
      no_stop: noStop
    });

    return {
      pace,
      evaluation,
      durationSeconds: runDurationSeconds
    };
  }, [currentLevel, distance, durationValidation.durationSeconds, noStop]);

  if (!currentLevel) {
    return (
      <section className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-emerald-100">
        <p className="text-lg font-semibold">Quest complete.</p>
        <p className="mt-1 text-sm text-emerald-200/90">All levels passed. Keep logging to maintain consistency.</p>
      </section>
    );
  }

  return (
    <section className="theme-card space-y-4 p-5">
      <h3 className="card-title">Quick Run Log</h3>
      <form
        action={(formData) => {
          setError(null);
          setMessage(null);
          startTransition(async () => {
            const result = await createRunnerRunLogAction(formData);
            if (!result.success) {
              setError(result.message);
              return;
            }

            setMessage(result.message);
            setDistance('');
            setDurationInput('');
            setNoStop(false);
            setIsDurationTouched(false);
            router.refresh();
          });
        }}
        className="grid gap-3"
      >
        <input type="hidden" name="no_stop" value={String(noStop)} />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 label-text">
            <span>Run Date</span>
            <input
              type="date"
              name="run_date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="theme-input"
            />
          </label>
          <label className="space-y-1 label-text">
            <span>Distance (km)</span>
            <input
              type="number"
              name="distance_km"
              min="0.1"
              step="0.01"
              required
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
              className="theme-input"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 label-text">
            <span>Duration (mmss)</span>
            <input
              type="text"
              name="duration_input"
              inputMode="numeric"
              required
              placeholder="0900"
              value={durationInput}
              onBlur={() => setIsDurationTouched(true)}
              onChange={(event) => {
                setIsDurationTouched(true);
                setDurationInput(event.target.value);
              }}
              className="theme-input"
            />
            <p className="helper-text">Examples: 0900 → 9:00, 1245 → 12:45, 45 → 0:45</p>
            {isDurationTouched && durationValidation.error ? (
              <p className="text-xs text-amber-300">{durationValidation.error}</p>
            ) : null}
          </label>
          <label className="space-y-1 label-text">
            <span>Effort</span>
            <select
              name="effort"
              defaultValue="normal"
              className="theme-input"
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
          <input type="checkbox" checked={noStop} onChange={(event) => setNoStop(event.target.checked)} className="h-4 w-4 accent-sky-300" />
          I finished this run without stopping
        </label>

        <label className="space-y-1 label-text">
          <span>Note (optional)</span>
          <textarea
            name="note"
            rows={2}
            className="theme-textarea"
          />
        </label>

        {preview ? (
          <div className="action-surface p-3 text-sm text-[color:var(--text-primary)]">
            <p>Pace preview: <span className="font-medium text-white">{formatPace(preview.pace)}</span></p>
            <p>Duration: <span className="font-medium text-white">{Math.floor(preview.durationSeconds / 60)}:{String(preview.durationSeconds % 60).padStart(2, '0')}</span></p>
            <p className={preview.evaluation.passed ? 'text-emerald-300' : 'text-amber-300'}>
              {preview.evaluation.passed ? 'This attempt will pass the level.' : getFailureReason(preview.evaluation)}
            </p>
          </div>
        ) : null}

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="theme-button-primary w-fit disabled:opacity-60"
        >
          {isPending ? 'Saving...' : 'Log This Run'}
        </button>
      </form>
    </section>
  );
}
