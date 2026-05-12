'use client';

import { useState, useTransition } from 'react';
import { formatDuration, formatPace } from '@/lib/running/quest';
import { RunAttemptEvaluation, RunnerDashboardData, RunnerDashboardLevel, RunnerProgressStatus, RunnerRunResult } from '@/lib/running/quest.types';
import { RunnerQuestLogForm } from '@/components/health/RunnerQuestLogForm';
import { HealthTodayMissionCard } from '@/components/health/HealthTodayMissionCard';
import { claimHealthRewardAction, deleteHealthRewardAction, upsertHealthRewardAction } from '@/app/health/actions';

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
  const status = reward?.status === 'claimed' ? 'claimed' : missionDone ? 'unlocked' : 'locked';
  return (<section className="space-y-4 px-1">
    <HealthTodayMissionCard todayStatus={data.todayStatus} currentLevel={currentLevel} latestAttempt={currentLevel?.latestAttempt ?? null} />

    <section className="pt-2 sm:pt-3">
      {!reward ? <article className="rounded-3xl border border-dashed border-amber-200/35 bg-gradient-to-br from-[#2a1f12]/95 via-[#1f1710]/95 to-[#140f09]/95 p-5"><p className="text-xl font-semibold text-amber-50">ด่านนี้ยังไม่มีรางวัล</p><p className="mt-2 text-sm text-amber-100/85">ตั้งรางวัลเพื่อสร้างแรงจูงใจให้ตัวเอง</p><button onClick={()=>setOpen(true)} className="mt-3 rounded-xl border border-amber-300/40 px-4 py-2 text-amber-100">+ เพิ่ม Reward</button></article> :
      <article className="rounded-3xl border border-amber-300/25 bg-gradient-to-br from-[#1c1410] via-[#251912] to-[#120f0c] p-5">
        <div className="flex justify-between"><span className="rounded-full border px-3 py-1 text-xs text-amber-50">{status==='claimed'?'รับรางวัลแล้ว':status==='locked'?'ปลดล็อกเมื่อผ่านด่านนี้':'Reward Unlocked'}</span><div className="space-x-2"><button onClick={()=>setOpen(true)} className="text-xs text-amber-100">แก้ไข reward</button><form action={deleteHealthRewardAction} className="inline"><input type="hidden" name="level_id" value={currentLevel?.id ?? ''}/><button className="text-xs text-rose-200">ลบ reward</button></form></div></div>
        <p className="mt-3 text-2xl font-semibold text-amber-50">{reward.title}</p><p className="text-sm text-amber-100/75">{reward.description}</p><p className="mt-2 text-sm italic text-amber-100/90">{reward.emotionalCopy}</p>
        <form action={claimHealthRewardAction}><input type="hidden" name="level_id" value={currentLevel?.id ?? ''}/><button disabled={status!=='unlocked'||isPending} className="mt-4 w-full rounded-xl bg-amber-200 px-4 py-3 font-semibold text-[#2d1f10]">{status==='locked'?'ผ่านด่านนี้เพื่อปลดล็อก':status==='claimed'?'รับรางวัลนี้แล้ว':'Mark Reward Claimed'}</button></form>
      </article>}
    </section>

    {open && currentLevel ? <form action={(fd)=>{start(async()=>{await upsertHealthRewardAction(fd);setOpen(false);});}} className="rounded-2xl border border-white/10 bg-slate-900 p-4"><input type="hidden" name="level_id" value={currentLevel.id}/><p className="mb-3 text-white">เพิ่ม/แก้ไข Reward</p><input name="title" defaultValue={reward?.title ?? 'Running Reward'} placeholder="reward title" className="mb-2 w-full rounded bg-slate-800 p-2 text-white"/><input name="description" defaultValue={reward?.description ?? 'รางวัลของคนที่ผ่านด่านวิ่งนี้ได้'} placeholder="short description" className="mb-2 w-full rounded bg-slate-800 p-2 text-white"/><input name="emotional_copy" defaultValue={reward?.emotionalCopy ?? 'เมื่อคุณผ่านด่านนี้ คุณไม่ได้แค่วิ่งครบ แต่คุณกำลังกลายเป็นคนที่แข็งแรงขึ้นจริง ๆ'} className="mb-2 w-full rounded bg-slate-800 p-2 text-white"/><input name="image_url" defaultValue={reward?.imageUrl ?? ''} placeholder="reward image URL" className="mb-2 w-full rounded bg-slate-800 p-2 text-white"/><div className="flex gap-2"><button type="submit" className="theme-button-primary">บันทึก</button><button type="button" onClick={()=>setOpen(false)} className="theme-button-secondary">ยกเลิก</button></div></form> : null}

    <div id="quick-log"><RunnerQuestLogForm currentLevel={currentLevel} /></div>
    <section><h3 className="mb-3 text-lg font-semibold text-white">ความคืบหน้าแต่ละระดับ</h3><section className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-5">{data.levels.map((level)=>{const evaluation=buildEvaluation(level); const isCurrent=currentLevel?.id===level.id; const isPassed=level.progress?.status==='passed'; const isLocked=level.progress?.status==='locked'; return <article key={level.id} className={`rounded-xl border p-3 ${isCurrent?'border-cyan-300/50 bg-[#0B2239]':isPassed?'border-emerald-400/30 bg-emerald-950/30':isLocked?'border-slate-600 bg-slate-900/90':'border-white/10 bg-[#111827]'}`}><div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-white">Level {level.level_number}</p><span className={`rounded-full border px-2 py-0.5 text-xs ${statusBadge(level.progress?.status)}`}>{statusLabel(level.progress?.status)}</span></div><p className="mt-1 text-sm font-medium text-slate-100">{level.distance_target_km} km · {formatPace(level.pace_target_seconds_per_km)}</p><div className="mt-2 space-y-1 text-xs text-slate-200"><p>{evaluation && evaluation.distanceRemainingKm===0?'✅':'⬜'} ระยะถึงเป้า</p></div></article>;})}</section></section>
    <article id="attempt-history" className="premium-card bg-[#0F172A]"><h3 className="text-lg font-semibold text-white">ประวัติการวิ่ง</h3><div className="mt-3 space-y-2">{data.logs.slice(0,20).map((log)=><div key={log.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm font-medium text-slate-100">{log.run_date} · {log.level?.title ?? '-'}</p><span className={`rounded-full border px-2 py-0.5 text-[11px] ${resultBadgeClass[log.result]}`}>{resultLabel[log.result]}</span></div><p className="mt-1 text-xs text-slate-300">{log.distance_km.toFixed(2)} km · {formatDuration(log.duration_seconds)} · {formatPace(log.pace_seconds_per_km)} · {log.no_stop ? 'ไม่หยุด' : 'มีหยุด'}</p></div>)}</div></article>
  </section>);
}
