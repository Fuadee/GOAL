import { markRunnerRestDayAction } from '@/app/health/actions';
import { formatPace, getHealthTodayMissionSummary } from '@/lib/running/quest';
import { RunnerDashboardLevel, RunnerRunLog, RunnerTodayStatus } from '@/lib/running/quest.types';

const statusConfig: Record<RunnerTodayStatus, { label: string; className: string }> = {
  not_run: {
    label: 'ยังไม่ได้วิ่งวันนี้',
    className: 'border-amber-300/40 bg-amber-500/20 text-amber-100'
  },
  ran: {
    label: 'วิ่งแล้ววันนี้',
    className: 'border-emerald-300/40 bg-emerald-500/20 text-emerald-100'
  },
  rest: {
    label: 'วันพัก',
    className: 'border-slate-300/30 bg-slate-500/20 text-slate-100'
  }
};

export function HealthTodayMissionCard({
  todayStatus,
  currentLevel,
  latestAttempt
}: {
  todayStatus: RunnerTodayStatus;
  currentLevel: RunnerDashboardLevel | null;
  latestAttempt: RunnerRunLog | null;
}) {
  const missionSummary = getHealthTodayMissionSummary(todayStatus, currentLevel, latestAttempt);

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0F1B2E] to-[#07111F] p-5 shadow-[0_12px_36px_rgba(6,14,30,0.55)] md:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">TODAY&apos;S MISSION</p>
      <h2 className="mt-2 text-2xl font-bold tracking-wide text-slate-50">ภารกิจวันนี้</h2>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${statusConfig[todayStatus].className}`}>
          {statusConfig[todayStatus].label}
        </span>
        <span className="text-sm text-slate-300">โฟกัสแค่งานเดียวให้ผ่านวันนี้</span>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Active Level</p>
          <p className="mt-1 text-lg font-semibold text-slate-50">{currentLevel ? currentLevel.title : 'Mission Cleared'}</p>
          {currentLevel ? (
            <ul className="mt-2 space-y-1 text-sm text-slate-200">
              <li>ระยะเป้าหมาย: {currentLevel.distance_target_km} km</li>
              <li>Pace เป้าหมาย: {formatPace(currentLevel.pace_target_seconds_per_km)}</li>
              <li>เงื่อนไข: ห้ามหยุดวิ่ง</li>
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-300">คงวินัยต่อเนื่อง แล้วค่อยขยายเป้าหมายใหม่</p>
          )}
        </div>

        <article className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-200">Next Action</p>
          <p className="mt-1 text-base font-semibold text-slate-50">{missionSummary.primaryText}</p>
        </article>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <a href="#quick-log" className="theme-button-primary inline-flex items-center justify-center px-5 py-2.5 text-base">
          {missionSummary.primaryActionLabel}
        </a>
        <a href="#quick-log" className="theme-button-secondary">บันทึกย้อนหลัง</a>
        <form action={markRunnerRestDayAction}>
          <input type="hidden" name="rest_date" value={new Date().toISOString().slice(0, 10)} />
          <button type="submit" className="theme-button-secondary">เลือกเป็นวันพัก</button>
        </form>
        <a href="#attempt-history" className="theme-button-secondary">ดูประวัติ</a>
      </div>
    </section>
  );
}
