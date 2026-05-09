import { markRunnerRestDayAction } from '@/app/health/actions';
import { formatPace, getHealthTodayMissionSummary } from '@/lib/running/quest';
import { RunnerDashboardLevel, RunnerRunLog, RunnerTodayStatus } from '@/lib/running/quest.types';

const statusConfig: Record<RunnerTodayStatus, { label: string; className: string }> = {
  not_run: {
    label: 'ยังไม่ได้วิ่งวันนี้',
    className: 'border-amber-300/40 bg-amber-500/20 text-amber-100'
  },
  ran: {
    label: 'ทำสำเร็จแล้ววันนี้',
    className: 'border-emerald-300/40 bg-emerald-500/20 text-emerald-100'
  },
  rest: {
    label: 'วันพัก',
    className: 'border-slate-300/30 bg-slate-500/20 text-slate-100'
  }
};

export function HealthTodayMissionCard({ todayStatus, currentLevel, latestAttempt }: { todayStatus: RunnerTodayStatus; currentLevel: RunnerDashboardLevel | null; latestAttempt: RunnerRunLog | null; }) {
  const missionSummary = getHealthTodayMissionSummary(todayStatus, currentLevel, latestAttempt);

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0F1B2E] to-[#07111F] p-5 shadow-[0_12px_36px_rgba(6,14,30,0.55)]">
      <h2 className="text-2xl font-bold text-slate-50">ภารกิจวันนี้</h2>
      <div className="mt-2 flex items-center gap-2">
        <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${statusConfig[todayStatus].className}`}>{statusConfig[todayStatus].label}</span>
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-[#111827] p-4">
        <p className="text-sm font-semibold text-slate-50">{currentLevel ? `Level ${currentLevel.level_number} · ${currentLevel.distance_target_km} km` : 'Mission Cleared'}</p>
        {currentLevel ? (
          <p className="mt-1 text-sm text-slate-300">Pace เป้าหมาย {formatPace(currentLevel.pace_target_seconds_per_km)} · เงื่อนไขวิ่งต่อเนื่องไม่หยุด</p>
        ) : (
          <p className="mt-1 text-sm text-slate-300">รักษาวินัยการวิ่งต่อเนื่องไว้ให้ได้</p>
        )}
      </div>

      <article className="mt-3 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3">
        <p className="text-xs text-cyan-100">Next Action</p>
        <p className="text-base font-semibold text-slate-50">{missionSummary.primaryText}</p>
      </article>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <a href="#quick-log" className="theme-button-primary inline-flex items-center justify-center px-5 py-2.5 text-base">บันทึกผลวิ่ง</a>
        <a href="#" className="theme-button-secondary">ดูเงื่อนไข Level</a>
        <a href="#attempt-history" className="theme-button-secondary">ดูประวัติ</a>
        <form action={markRunnerRestDayAction}>
          <input type="hidden" name="rest_date" value={new Date().toISOString().slice(0, 10)} />
          <button type="submit" className="theme-button-secondary">เลือกเป็นวันพัก</button>
        </form>
      </div>
    </section>
  );
}
