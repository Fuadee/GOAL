'use client';

import Image from 'next/image';
import { formatDuration, formatPace } from '@/lib/running/quest';
import { RunAttemptEvaluation, RunnerDashboardData, RunnerDashboardLevel, RunnerProgressStatus, RunnerRunResult } from '@/lib/running/quest.types';
import { RunnerQuestLogForm } from '@/components/health/RunnerQuestLogForm';

// ...existing constants
const resultLabel: Record<RunnerRunResult, string> = { passed:'ผ่านแล้ว', failed_distance:'ไม่ผ่าน: ระยะทาง', failed_pace:'ไม่ผ่าน: Pace', failed_stopped:'ไม่ผ่าน: หยุดวิ่ง', failed_multiple:'ไม่ผ่าน: หลายเงื่อนไข' };
const resultBadgeClass: Record<RunnerRunResult, string> = { passed:'bg-emerald-500/20 !text-[#047857] border-emerald-400/30', failed_distance:'bg-amber-500/20 !text-[#B45309] border-amber-400/30', failed_pace:'bg-orange-500/20 !text-[#C2410C] border-orange-400/30', failed_stopped:'bg-rose-500/20 !text-[#BE123C] border-rose-400/30', failed_multiple:'bg-fuchsia-500/20 !text-[#A21CAF] border-fuchsia-400/30' };
const statusBadge=(s:RunnerProgressStatus|undefined)=>s==='passed'?'border-emerald-400/30 bg-emerald-500/20 text-emerald-200':s==='available'?'border-cyan-400/40 bg-cyan-500/15 text-cyan-100':'border-[#FDA4AF] bg-[#FFE4E6] !text-[#BE123C]';
const statusLabel=(s:RunnerProgressStatus|undefined)=>s==='passed'?'ผ่านแล้ว':s==='available'?'กำลังทำอยู่':'ยังล็อก';
function buildEvaluation(level: RunnerDashboardLevel): RunAttemptEvaluation | null { const latest = level.latestAttempt; if (!latest) return null; const unmet:Array<'distance'|'pace'|'no_stop'>=[]; if (latest.distance_km < level.distance_target_km) unmet.push('distance'); if (latest.pace_seconds_per_km > level.pace_target_seconds_per_km) unmet.push('pace'); if (!latest.no_stop) unmet.push('no_stop'); return { result: latest.result, passed: latest.result === 'passed', distanceRemainingKm: Math.max(level.distance_target_km - latest.distance_km, 0), paceDeltaSeconds: Math.max(latest.pace_seconds_per_km - level.pace_target_seconds_per_km, 0), unmetConditions: unmet }; }

export function RunnerQuestDashboard({ data, goalImageUrl }: { data: RunnerDashboardData; goalImageUrl: string | null }) {
  const currentLevel = data.currentLevel;
  return (<section className="space-y-4 px-1">
    <HealthPrimaryGoalCard data={data} imageUrl={goalImageUrl} />

    <div id="quick-log"><RunnerQuestLogForm currentLevel={currentLevel} /></div>
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
                  ? 'border-cyan-300/50 bg-[#0B2239]'
                  : isPassed
                    ? 'border-emerald-400/30 bg-emerald-950/30'
                    : isLocked
                      ? 'border-slate-600 bg-slate-900/90'
                      : 'border-white/10 bg-[#111827]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-semibold ${isCurrent ? '!text-[#FFFFFF]' : 'text-white'}`}>Level {level.level_number}</p>
                <span className={`rounded-full border px-2 py-0.5 text-xs ${isCurrent ? 'border-white/80 bg-white/90 !text-[#0B2239]' : statusBadge(level.progress?.status)}`}>
                  {statusLabel(level.progress?.status)}
                </span>
              </div>
              <p className={`mt-1 text-sm font-medium ${isCurrent ? '!text-[#FFFFFF]' : 'text-slate-100'}`}>
                {level.distance_target_km} km · {formatPace(level.pace_target_seconds_per_km)}
              </p>
              <div className={`mt-2 space-y-1 text-xs ${isCurrent ? '!text-[#FFFFFF]' : 'text-slate-200'}`}>
                <p>{evaluation && evaluation.distanceRemainingKm === 0 ? '✅' : '⬜'} ระยะถึงเป้า</p>
              </div>
            </article>
          );
        })}
      </section>
    </section>
    <article id="attempt-history" className="premium-card bg-[#0F172A]"><h3 className="text-lg font-semibold text-white">ประวัติการวิ่ง</h3><div className="mt-3 space-y-2">{data.logs.slice(0,20).map((log)=><div key={log.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm font-medium text-slate-100">{log.run_date} · {log.level?.title ?? '-'}</p><span className={`rounded-full border px-2 py-0.5 text-[11px] ${resultBadgeClass[log.result]}`}>{resultLabel[log.result]}</span></div><p className="mt-1 text-xs text-slate-300">{log.distance_km.toFixed(2)} km · {formatDuration(log.duration_seconds)} · {formatPace(log.pace_seconds_per_km)} · {log.no_stop ? 'ไม่หยุด' : 'มีหยุด'}</p></div>)}</div></article>
  </section>);
}

function HealthPrimaryGoalCard({ data, imageUrl }: { data: RunnerDashboardData; imageUrl: string | null }) {
  const targetDistanceKm = 5;
  const bestDistanceKm = data.logs.reduce((best, log) => Math.max(best, log.distance_km), 0);
  const progress = Math.min(Math.max((bestDistanceKm / targetDistanceKm) * 100, 0), 100);

  return <article className="grid overflow-hidden rounded-[24px] border border-blue-200 bg-gradient-to-br from-white via-blue-50/40 to-sky-100/60 shadow-[0_22px_52px_-38px_rgba(37,99,235,0.55)] md:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.7fr)]">
    <div className="relative min-h-[210px] overflow-hidden bg-blue-100 md:min-h-full">
      {imageUrl ? <Image
        src={imageUrl}
        alt="ภาพเป้าหมายการวิ่ง 5 กิโลเมตรจากบอร์ดวิสัยทัศน์"
        fill
        priority
        sizes="(max-width: 767px) 100vw, 32vw"
        className="object-cover object-[center_45%]"
      /> : <div className="flex h-full min-h-[210px] items-center justify-center bg-gradient-to-br from-blue-100 to-sky-50 text-blue-600" aria-label="ยังไม่มีภาพเป้าหมายด้านสุขภาพในบอร์ดวิสัยทัศน์">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-14 w-14"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 5.5 11 8l2 2.5m-2-2.5-2.5 3.5L5 13m6-5 2.5 1L16 7m-5 5-2 3-4 2m8-6 2.5 3 3.5 1.5M14.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" /></svg>
      </div>}
    </div>

    <div className="flex min-w-0 flex-col justify-center p-5 sm:p-7 lg:p-8">
      <p className="text-sm font-semibold text-blue-700">เป้าหมายหลักด้านสุขภาพ</p>
      <h1 className="mt-2 text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">วิ่ง 5 กิโลเมตรให้สำเร็จตามเป้าหมาย</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">ฝึกวิ่งอย่างสม่ำเสมอ เพื่อให้สามารถวิ่งครบ 5 กิโลเมตรได้อย่างต่อเนื่อง ด้วยความแข็งแรงและเวลาตามเป้าหมาย</p>

      <div className="mt-6 rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="font-medium text-slate-700">ความคืบหน้าสู่เป้าหมายวิ่ง 5K</span>
          <span className="font-numeric shrink-0 text-lg font-semibold text-blue-700">{progress.toFixed(1)}%</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-blue-100" role="progressbar" aria-label="ความคืบหน้าสู่เป้าหมายวิ่ง 5 กิโลเมตร" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="h-full rounded-full bg-blue-600 transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-sm text-slate-600">{data.logs.length > 0 ? `ระยะทางสูงสุด ${bestDistanceKm.toFixed(1)} จาก ${targetDistanceKm} กิโลเมตร` : 'ยังไม่มีผลการวิ่งที่บันทึกไว้'}</p>
      </div>
    </div>
  </article>;
}
