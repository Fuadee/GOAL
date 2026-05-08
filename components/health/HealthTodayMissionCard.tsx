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
    className: 'border-slate-300/30 bg-slate-500/20 text-[#1E293B]'
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
    <section className="rounded-3xl border border-[#DDE3D5]/25 bg-white p-6 shadow-sm md:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#334155]">TODAY&apos;S MISSION</p>
      <h2 className="mt-2 text-3xl font-bold tracking-wide text-[#1E293B]">ภารกิจวันนี้</h2>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${statusConfig[todayStatus].className}`}>
          {statusConfig[todayStatus].label}
        </span>
        <span className="text-sm text-[#64748B]">วันนี้ต้องผ่านด่านนี้</span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[#DDE3D5] bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[#94A3B8]">Active Level</p>
          <p className="mt-1 text-lg font-semibold text-[#1E293B]">{currentLevel ? currentLevel.title : 'Mission Cleared'}</p>
          {currentLevel ? (
            <ul className="mt-2 space-y-1 text-sm text-[#64748B]">
              <li>ระยะเป้าหมาย: {currentLevel.distance_target_km} km</li>
              <li>Pace เป้าหมาย: {formatPace(currentLevel.pace_target_seconds_per_km)}</li>
              <li>เงื่อนไข: ห้ามหยุดวิ่ง</li>
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[#64748B]">คงวินัยต่อเนื่อง แล้วค่อยขยายเป้าหมายใหม่</p>
          )}
        </div>

        <div className="rounded-xl border border-[#DDE3D5]/20 bg-[#EEF1EA]/10 p-4">
          <p className="text-sm font-semibold text-[#334155]">วันนี้คุณต้องทำอะไร</p>
          <p className="mt-2 text-sm text-[#334155]/90">แค่ผ่านด่านปัจจุบันก่อน ไม่ต้องคิดถึง 5 km ตอนนี้</p>
        </div>
      </div>

      <article className="mt-4 rounded-xl border border-[#DDE3D5]/30 bg-[#EEF1EA]/10 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-[#64748B]">Next Action</p>
        <p className="mt-1 text-base font-semibold text-[#1E293B]">{missionSummary.primaryText}</p>
      </article>

      <div className="mt-5 flex flex-wrap gap-3">
        <a href="#quick-log" className="theme-button-primary inline-flex items-center justify-center px-5 py-2.5 text-base">
          {missionSummary.primaryActionLabel}
        </a>
        <a href="#quick-log" className="theme-button-secondary">บันทึกผลย้อนหลัง</a>
        <form action={markRunnerRestDayAction}>
          <input type="hidden" name="rest_date" value={new Date().toISOString().slice(0, 10)} />
          <button type="submit" className="theme-button-secondary">เลือกเป็นวันพัก</button>
        </form>
        <a href="#attempt-history" className="theme-button-secondary">ดูประวัติการซ้อม</a>
      </div>
    </section>
  );
}
