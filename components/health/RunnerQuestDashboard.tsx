'use client';

import { useState, useTransition } from 'react';
import { formatDuration, formatPace } from '@/lib/running/quest';
import { RunAttemptEvaluation, RunnerDashboardData, RunnerDashboardLevel, RunnerProgressStatus, RunnerRunResult } from '@/lib/running/quest.types';
import { RunnerQuestLogForm } from '@/components/health/RunnerQuestLogForm';
import { HealthTodayMissionCard } from '@/components/health/HealthTodayMissionCard';
import { claimHealthRewardAction, deleteHealthRewardAction, upsertHealthRewardAction } from '@/app/health/actions';
import { RewardPreviewCard } from '@/components/rewards/RewardPreviewCard';
import { RewardFormModal } from '@/components/rewards/RewardFormModal';

// ...existing constants
const resultLabel: Record<RunnerRunResult, string> = { passed:'ผ่านแล้ว', failed_distance:'ไม่ผ่าน: ระยะทาง', failed_pace:'ไม่ผ่าน: Pace', failed_stopped:'ไม่ผ่าน: หยุดวิ่ง', failed_multiple:'ไม่ผ่าน: หลายเงื่อนไข' };
const resultBadgeClass: Record<RunnerRunResult, string> = { passed:'bg-emerald-500/20 text-emerald-200 border-emerald-400/30', failed_distance:'bg-amber-500/20 text-amber-200 border-amber-400/30', failed_pace:'bg-orange-500/20 text-orange-200 border-orange-400/30', failed_stopped:'bg-rose-500/20 text-rose-200 border-rose-400/30', failed_multiple:'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/30' };
const statusBadge=(s:RunnerProgressStatus|undefined)=>s==='passed'?'border-emerald-400/30 bg-emerald-500/20 text-emerald-200':s==='available'?'border-cyan-400/40 bg-cyan-500/15 text-cyan-100':'border-slate-600 bg-slate-800/90 text-slate-300';
const statusLabel=(s:RunnerProgressStatus|undefined)=>s==='passed'?'ผ่านแล้ว':s==='available'?'กำลังทำอยู่':'ยังล็อก';
function buildEvaluation(level: RunnerDashboardLevel): RunAttemptEvaluation | null { const latest = level.latestAttempt; if (!latest) return null; const unmet:Array<'distance'|'pace'|'no_stop'>=[]; if (latest.distance_km < level.distance_target_km) unmet.push('distance'); if (latest.pace_seconds_per_km > level.pace_target_seconds_per_km) unmet.push('pace'); if (!latest.no_stop) unmet.push('no_stop'); return { result: latest.result, passed: latest.result === 'passed', distanceRemainingKm: Math.max(level.distance_target_km - latest.distance_km, 0), paceDeltaSeconds: Math.max(latest.pace_seconds_per_km - level.pace_target_seconds_per_km, 0), unmetConditions: unmet }; }

export function RunnerQuestDashboard({ data }: { data: RunnerDashboardData }) {
  const currentLevel = data.currentLevel;
  const [isPending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const reward = data.healthMissionReward;
  const missionDone = currentLevel?.progress?.status === 'passed';
  return (<section className="space-y-4 px-1">
    <HealthTodayMissionCard todayStatus={data.todayStatus} currentLevel={currentLevel} latestAttempt={currentLevel?.latestAttempt ?? null} />

    <RewardPreviewCard
      missionTitle={currentLevel ? `Level ${currentLevel.level_number} · ${currentLevel.distance_target_km} km` : 'ภารกิจปัจจุบัน'}
      emptyTitle="ด่านนี้ยังไม่มีรางวัล"
      emptyDescription="ตั้งรางวัลเพื่อสร้างแรงจูงใจให้ตัวเอง"
      lockedCta="ผ่านด่านนี้เพื่อปลดล็อก"
      reward={reward ?? undefined}
      isMissionCompleted={missionDone}
      onAddReward={() => setOpen(true)}
      onDeleteReward={() => {
        if (!currentLevel) return;
        const fd = new FormData();
        fd.set('level_id', currentLevel.id);
        start(async () => {
          await deleteHealthRewardAction(fd);
        });
      }}
      onClaimReward={() => {
        if (!currentLevel) return;
        const fd = new FormData();
        fd.set('level_id', currentLevel.id);
        start(async () => {
          await claimHealthRewardAction(fd);
        });
      }}
      isClaimingReward={isPending}
    />

    {currentLevel ? (
      <RewardFormModal
        open={open}
        levelId={currentLevel.id}
        defaultValues={{
          title: reward?.title,
          description: reward?.description,
          emotionalCopy: reward?.emotionalCopy,
          imageUrl: reward?.imageUrl
        }}
        onClose={() => setOpen(false)}
        onSubmit={(fd) => {
          start(async () => {
            await upsertHealthRewardAction(fd);
            setOpen(false);
          });
        }}
      />
    ) : null}


    <div id="quick-log"><RunnerQuestLogForm currentLevel={currentLevel} /></div>
    <section><h3 className="mb-3 text-lg font-semibold text-white">ความคืบหน้าแต่ละระดับ</h3><section className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-5">{data.levels.map((level)=>{const evaluation=buildEvaluation(level); const isCurrent=currentLevel?.id===level.id; const isPassed=level.progress?.status==='passed'; const isLocked=level.progress?.status==='locked'; return <article key={level.id} className={`rounded-xl border p-3 ${isCurrent?'border-cyan-300/50 bg-[#0B2239]':isPassed?'border-emerald-400/30 bg-emerald-950/30':isLocked?'border-slate-600 bg-slate-900/90':'border-white/10 bg-[#111827]'}`}><div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-white">Level {level.level_number}</p><span className={`rounded-full border px-2 py-0.5 text-xs ${statusBadge(level.progress?.status)}`}>{statusLabel(level.progress?.status)}</span></div><p className="mt-1 text-sm font-medium text-slate-100">{level.distance_target_km} km · {formatPace(level.pace_target_seconds_per_km)}</p><div className="mt-2 space-y-1 text-xs text-slate-200"><p>{evaluation && evaluation.distanceRemainingKm===0?'✅':'⬜'} ระยะถึงเป้า</p></div></article>;})}</section></section>
    <article id="attempt-history" className="premium-card bg-[#0F172A]"><h3 className="text-lg font-semibold text-white">ประวัติการวิ่ง</h3><div className="mt-3 space-y-2">{data.logs.slice(0,20).map((log)=><div key={log.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm font-medium text-slate-100">{log.run_date} · {log.level?.title ?? '-'}</p><span className={`rounded-full border px-2 py-0.5 text-[11px] ${resultBadgeClass[log.result]}`}>{resultLabel[log.result]}</span></div><p className="mt-1 text-xs text-slate-300">{log.distance_km.toFixed(2)} km · {formatDuration(log.duration_seconds)} · {formatPace(log.pace_seconds_per_km)} · {log.no_stop ? 'ไม่หยุด' : 'มีหยุด'}</p></div>)}</div></article>
  </section>);
}
