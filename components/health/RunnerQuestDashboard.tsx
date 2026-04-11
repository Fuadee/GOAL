import { formatDuration, formatPace, getFailureReason } from '@/lib/running/quest';
import { RunAttemptEvaluation, RunnerDashboardData, RunnerDashboardLevel, RunnerProgressStatus, RunnerRunResult } from '@/lib/running/quest.types';
import { RunnerQuestLogForm } from '@/components/health/RunnerQuestLogForm';
import { HealthTodayMissionCard } from '@/components/health/HealthTodayMissionCard';
import { HealthExecutionStrip } from '@/components/health/HealthExecutionStrip';

const resultLabel: Record<RunnerRunResult, string> = {
  passed: 'Passed',
  failed_distance: 'Failed: Distance',
  failed_pace: 'Failed: Pace',
  failed_stopped: 'Failed: Stopped',
  failed_multiple: 'Failed: Multiple'
};

const resultBadgeClass: Record<RunnerRunResult, string> = {
  passed: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
  failed_distance: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
  failed_pace: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
  failed_stopped: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
  failed_multiple: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/30'
};

function statusBadge(status: RunnerProgressStatus | undefined) {
  if (status === 'passed') return 'border-emerald-400/30 bg-emerald-500/20 text-emerald-200';
  if (status === 'available') return 'border-sky-400/30 bg-sky-500/20 text-sky-200';
  return 'border-slate-500/30 bg-slate-700/50 text-slate-300';
}

function statusLabel(status: RunnerProgressStatus | undefined) {
  if (status === 'passed') return 'Passed';
  if (status === 'available') return 'Available';
  return 'Locked';
}

function buildEvaluation(level: RunnerDashboardLevel): RunAttemptEvaluation | null {
  const latest = level.latestAttempt;
  if (!latest) return null;

  const unmet: Array<'distance' | 'pace' | 'no_stop'> = [];
  if (latest.distance_km < level.distance_target_km) unmet.push('distance');
  if (latest.pace_seconds_per_km > level.pace_target_seconds_per_km) unmet.push('pace');
  if (!latest.no_stop) unmet.push('no_stop');

  return {
    result: latest.result,
    passed: latest.result === 'passed',
    distanceRemainingKm: Math.max(level.distance_target_km - latest.distance_km, 0),
    paceDeltaSeconds: Math.max(latest.pace_seconds_per_km - level.pace_target_seconds_per_km, 0),
    unmetConditions: unmet
  };
}

export function RunnerQuestDashboard({ data }: { data: RunnerDashboardData }) {
  const currentLevel = data.currentLevel;

  return (
    <section className="space-y-6">
      <HealthTodayMissionCard todayStatus={data.todayStatus} currentLevel={currentLevel} latestAttempt={currentLevel?.latestAttempt ?? null} />
      <HealthExecutionStrip todayStatus={data.todayStatus} />

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="premium-card">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current Level</p>
          <p className="mt-2 text-xl font-semibold text-white">{currentLevel ? `Level ${currentLevel.level_number} · ${currentLevel.title}` : 'All levels passed'}</p>
        </article>
        <article className="premium-card">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Best Recent Attempt</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {data.logs[0] ? `${data.logs[0].distance_km.toFixed(2)} km · ${formatPace(data.logs[0].pace_seconds_per_km)}` : 'No attempt yet'}
          </p>
        </article>
      </section>

      <section className="premium-card">
        <h3 className="text-lg font-semibold text-white">Current Level Focus</h3>
        {currentLevel ? (
          <>
            <p className="text-slate-300">ภารกิจของวันนี้ชัดเจน: วิ่ง {currentLevel.distance_target_km} km แบบไม่หยุด</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-200">
              <li>Target distance: {currentLevel.distance_target_km} km</li>
              <li>Target pace: {formatPace(currentLevel.pace_target_seconds_per_km)}</li>
              <li>No stop required for pass</li>
            </ul>
            {currentLevel.latestAttempt ? (
              <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/70 p-3 text-sm text-slate-200">
                <p>Last attempt: {currentLevel.latestAttempt.distance_km.toFixed(2)} km · {formatDuration(currentLevel.latestAttempt.duration_seconds)} · {formatPace(currentLevel.latestAttempt.pace_seconds_per_km)}</p>
                {buildEvaluation(currentLevel) ? (
                  <p className="mt-1 text-amber-300">{getFailureReason(buildEvaluation(currentLevel)!)}</p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-400">เริ่มก่อน แล้วค่อยดูสถิติ</p>
            )}
          </>
        ) : (
          <p className="text-emerald-300">All levels complete. You reached 5 km with target pace unlocked.</p>
        )}
      </section>

      <div id="quick-log">
        <RunnerQuestLogForm currentLevel={currentLevel} />
      </div>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-white">Level Progression</h3>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {data.levels.map((level) => {
            const evaluation = buildEvaluation(level);
            const isCurrent = currentLevel?.id === level.id;

            return (
              <article
                key={level.id}
                className={`rounded-2xl border p-4 ${
                  isCurrent
                    ? 'border-sky-300/50 bg-sky-500/10 shadow-[0_0_30px_rgba(56,189,248,0.2)]'
                    : 'border-white/10 bg-slate-900/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Level {level.level_number}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${statusBadge(level.progress?.status)}`}>
                    {statusLabel(level.progress?.status)}
                  </span>
                </div>
                <p className="mt-2 text-lg font-semibold text-white">{level.title}</p>
                <p className="text-sm text-slate-300">Target {level.distance_target_km} km · {formatPace(level.pace_target_seconds_per_km)}</p>
                <p className="mt-1 inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 text-xs text-violet-200">No Stop Required</p>

                <div className="mt-3 space-y-1 text-xs text-slate-300">
                  <p>{evaluation && evaluation.distanceRemainingKm === 0 ? '✅' : '⬜'} Distance reached</p>
                  <p>{evaluation && !evaluation.unmetConditions.includes('no_stop') ? '✅' : '⬜'} No stop</p>
                  <p>{evaluation && !evaluation.unmetConditions.includes('pace') ? '✅' : '⬜'} Pace met</p>
                </div>
              </article>
            );
          })}
        </section>
      </section>

      <article id="attempt-history" className="premium-card">
        <h3 className="text-lg font-semibold text-white">Attempt History</h3>
        {data.logs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No run logs yet. Start with Level 1 and record your first attempt.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-slate-400">
                <tr>
                  <th className="pb-2 pr-3">Date</th>
                  <th className="pb-2 pr-3">Level</th>
                  <th className="pb-2 pr-3">Distance</th>
                  <th className="pb-2 pr-3">Duration</th>
                  <th className="pb-2 pr-3">Pace</th>
                  <th className="pb-2 pr-3">No Stop</th>
                  <th className="pb-2 pr-3">Result</th>
                  <th className="pb-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.slice(0, 25).map((log) => (
                  <tr key={log.id} className="border-t border-white/10 text-slate-200">
                    <td className="py-2 pr-3">{log.run_date}</td>
                    <td className="py-2 pr-3">{log.level?.title ?? '-'}</td>
                    <td className="py-2 pr-3">{log.distance_km.toFixed(2)} km</td>
                    <td className="py-2 pr-3">{formatDuration(log.duration_seconds)}</td>
                    <td className="py-2 pr-3">{formatPace(log.pace_seconds_per_km)}</td>
                    <td className="py-2 pr-3">{log.no_stop ? 'Yes' : 'No'}</td>
                    <td className="py-2 pr-3">
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${resultBadgeClass[log.result]}`}>
                        {resultLabel[log.result]}
                      </span>
                    </td>
                    <td className="py-2">{log.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total Attempts', String(data.totalAttempts)],
          ['Passed Levels', `${data.passedLevelsCount} / ${data.levels.length}`],
          ['Best Pace Ever', formatPace(data.bestPaceEver)],
          ['Longest No-Stop Distance', data.longestNoStopDistance ? `${data.longestNoStopDistance.toFixed(2)} km` : '--']
        ].map(([label, value]) => (
          <article key={label} className="premium-card">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
            <p className="mt-2 text-xl font-semibold text-white">{value}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
