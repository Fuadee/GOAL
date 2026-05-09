import { formatDuration, formatPace } from '@/lib/running/quest';
import { RunAttemptEvaluation, RunnerDashboardData, RunnerDashboardLevel, RunnerProgressStatus, RunnerRunResult } from '@/lib/running/quest.types';
import { RunnerQuestLogForm } from '@/components/health/RunnerQuestLogForm';
import { HealthTodayMissionCard } from '@/components/health/HealthTodayMissionCard';
import { HealthExecutionStrip } from '@/components/health/HealthExecutionStrip';

const resultLabel: Record<RunnerRunResult, string> = {
  passed: 'ผ่านแล้ว',
  failed_distance: 'ไม่ผ่าน: ระยะทาง',
  failed_pace: 'ไม่ผ่าน: Pace',
  failed_stopped: 'ไม่ผ่าน: หยุดวิ่ง',
  failed_multiple: 'ไม่ผ่าน: หลายเงื่อนไข'
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
  if (status === 'available') return 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100';
  return 'border-slate-600 bg-slate-800/90 text-slate-300';
}

function statusLabel(status: RunnerProgressStatus | undefined) {
  if (status === 'passed') return 'ผ่านแล้ว';
  if (status === 'available') return 'กำลังทำอยู่';
  return 'ยังล็อก';
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
  const todayText = data.todayStatus === 'ran' ? 'วิ่งแล้ววันนี้' : data.todayStatus === 'rest' ? 'วันนี้เป็นวันพัก' : 'ยังไม่ได้วิ่งวันนี้';
  const levelText = currentLevel ? `Level ${currentLevel.level_number} · ${currentLevel.distance_target_km} km` : 'เคลียร์ครบทุกระดับ';

  return (
    <section className="space-y-4 px-1">
      <section className="rounded-2xl border border-white/10 bg-[#07111F] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-[#0F172A] px-3 py-1 text-sm font-medium text-slate-100">วันนี้: {todayText}</span>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-100">{levelText}</span>
        </div>
        <p className="mt-2 text-sm text-slate-300">ผ่านแล้ว {data.passedLevelsCount} จาก {data.levels.length} ระดับ</p>
      </section>

      <HealthTodayMissionCard todayStatus={data.todayStatus} currentLevel={currentLevel} latestAttempt={currentLevel?.latestAttempt ?? null} />
      <HealthExecutionStrip todayStatus={data.todayStatus} />

      <div id="quick-log">
        <RunnerQuestLogForm currentLevel={currentLevel} />
      </div>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-white">ความคืบหน้าแต่ละระดับ</h3>
        <section className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-5">
          {data.levels.map((level) => {
            const evaluation = buildEvaluation(level);
            const isCurrent = currentLevel?.id === level.id;
            const isPassed = level.progress?.status === 'passed';
            const isLocked = level.progress?.status === 'locked';

            return (
              <article
                key={level.id}
                className={`rounded-xl border p-3 ${
                  isCurrent
                    ? 'border-cyan-300/50 bg-[#0B2239] shadow-[0_0_18px_rgba(34,211,238,0.2)]'
                    : isPassed
                    ? 'border-emerald-400/30 bg-emerald-950/30'
                    : isLocked
                    ? 'border-slate-600 bg-slate-900/90'
                    : 'border-white/10 bg-[#111827]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">Level {level.level_number}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${statusBadge(level.progress?.status)}`}>{statusLabel(level.progress?.status)}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-100">{level.distance_target_km} km · {formatPace(level.pace_target_seconds_per_km)}</p>
                <p className="mt-1 text-xs text-slate-300">เงื่อนไข: วิ่งต่อเนื่องไม่หยุด</p>

                <div className="mt-2 space-y-1 text-xs text-slate-200">
                  <p>{evaluation && evaluation.distanceRemainingKm === 0 ? '✅' : '⬜'} ระยะถึงเป้า</p>
                  <p>{evaluation && !evaluation.unmetConditions.includes('no_stop') ? '✅' : '⬜'} ไม่หยุดวิ่ง</p>
                  <p>{evaluation && !evaluation.unmetConditions.includes('pace') ? '✅' : '⬜'} Pace ถึงเป้า</p>
                </div>
              </article>
            );
          })}
        </section>
      </section>

      <article id="attempt-history" className="premium-card bg-[#0F172A]">
        <h3 className="text-lg font-semibold text-white">ประวัติการวิ่ง</h3>
        {data.logs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">ยังไม่มีประวัติการวิ่ง เริ่มบันทึกครั้งแรกได้เลย</p>
        ) : (
          <div className="mt-3 space-y-2">
            {data.logs.slice(0, 20).map((log) => (
              <div key={log.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-100">{log.run_date} · {log.level?.title ?? '-'}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${resultBadgeClass[log.result]}`}>{resultLabel[log.result]}</span>
                </div>
                <p className="mt-1 text-xs text-slate-300">{log.distance_km.toFixed(2)} km · {formatDuration(log.duration_seconds)} · {formatPace(log.pace_seconds_per_km)} · {log.no_stop ? 'ไม่หยุด' : 'มีหยุด'}</p>
              </div>
            ))}
          </div>
        )}
      </article>

      <details className="rounded-2xl border border-white/10 bg-[#0F1B2E] p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-200">More Health Insights · ข้อมูลสุขภาพเพิ่มเติม</summary>
        <section className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            ['Total Attempts', String(data.totalAttempts)],
            ['Best Pace Ever', data.bestPaceEver ? formatPace(data.bestPaceEver) : '--'],
            ['Longest No-Stop Distance', data.longestNoStopDistance ? `${data.longestNoStopDistance.toFixed(2)} km` : '--']
          ].map(([label, value]) => (
            <article key={label} className="rounded-xl border border-white/10 bg-[#111827] p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
              <p className="mt-1 text-base font-semibold text-white">{value}</p>
            </article>
          ))}
        </section>
      </details>
    </section>
  );
}
