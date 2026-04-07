'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createRunnerRunLogAction } from '@/app/health/actions';
import {
  calculatePaceSecondsPerKm,
  evaluateRunAttempt,
  formatDuration,
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
  const [durationMinutes, setDurationMinutes] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [noStop, setNoStop] = useState(false);
  const [isDurationTouched, setIsDurationTouched] = useState(false);

  const durationValidation = useMemo(
    () => parseMinuteSecondDuration(durationMinutes, durationSeconds),
    [durationMinutes, durationSeconds]
  );

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
    <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <h3 className="text-lg font-semibold text-white">Quick Run Log</h3>
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
            setDurationMinutes('');
            setDurationSeconds('');
            setNoStop(false);
            setIsDurationTouched(false);
            router.refresh();
          });
        }}
        className="grid gap-3"
      >
        <input type="hidden" name="no_stop" value={String(noStop)} />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-300">
            <span>Run Date</span>
            <input
              type="date"
              name="run_date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-300"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-300">
            <span>Distance (km)</span>
            <input
              type="number"
              name="distance_km"
              min="0.1"
              step="0.01"
              required
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-300"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-300">
            <span>Duration</span>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Minutes</span>
                <input
                  type="number"
                  name="duration_minutes"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  required
                  placeholder="12"
                  value={durationMinutes}
                  onBlur={() => setIsDurationTouched(true)}
                  onChange={(event) => {
                    setIsDurationTouched(true);
                    setDurationMinutes(event.target.value);
                  }}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-300"
                />
              </div>
              <span className="hidden pb-2 text-slate-500 sm:inline">:</span>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Seconds</span>
                <input
                  type="number"
                  name="duration_seconds"
                  inputMode="numeric"
                  min="0"
                  max="59"
                  step="1"
                  required
                  placeholder="45"
                  value={durationSeconds}
                  onBlur={() => setIsDurationTouched(true)}
                  onChange={(event) => {
                    setIsDurationTouched(true);
                    setDurationSeconds(event.target.value);
                  }}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-300"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400">Example: 12 min 45 sec</p>
            {isDurationTouched && durationValidation.error ? (
              <p className="text-xs text-amber-300">{durationValidation.error}</p>
            ) : null}
          </label>
          <label className="space-y-1 text-sm text-slate-300">
            <span>Effort</span>
            <select
              name="effort"
              defaultValue="normal"
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-300"
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={noStop} onChange={(event) => setNoStop(event.target.checked)} className="h-4 w-4" />
          I finished this run without stopping
        </label>

        <label className="space-y-1 text-sm text-slate-300">
          <span>Note (optional)</span>
          <textarea
            name="note"
            rows={2}
            className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-300"
          />
        </label>

        {preview ? (
          <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 text-sm text-slate-200">
            <p>Pace preview: <span className="font-medium text-white">{formatPace(preview.pace)}</span></p>
            <p>Duration: <span className="font-medium text-white">{formatDuration(preview.durationSeconds)}</span></p>
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
          className="w-fit rounded-full bg-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/30 disabled:opacity-60"
        >
          {isPending ? 'Saving...' : 'Log This Run'}
        </button>
      </form>
    </section>
  );
}
