'use client';

import { useState, useTransition } from 'react';
import { RewardFormModal } from '@/components/rewards/RewardFormModal';
import { claimInnovationRewardAction, upsertInnovationRewardAction } from '@/app/innovation/actions';
import type { InnovationCardViewModel } from '@/lib/innovation/types';

export function MissionRewardSection({ mission }: { mission: InnovationCardViewModel | null }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!mission) return null;
  const progressDone = mission.progressPercent >= 100;
  const hasReward = Boolean(mission.reward_title || mission.reward_image_url || mission.reward_description || mission.reward_emotional_copy);
  const status = mission.reward_status === 'claimed' ? 'claimed' : progressDone ? 'ready_to_claim' : 'locked';

  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.3)] sm:p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">รางวัลภารกิจ</h3>
          <p className="text-xs leading-5 text-slate-500">รางวัลเมื่อภารกิจสำเร็จ</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          {status === 'claimed' ? 'รับแล้ว' : status === 'ready_to_claim' ? 'พร้อมรับ' : 'ยังล็อกอยู่'}
        </span>
      </div>
      {!hasReward ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-5 text-center">
          <p className="text-sm leading-6 text-slate-600">ตั้งรางวัลให้ภารกิจนี้ เพื่อเพิ่มแรงจูงใจในการทำให้สำเร็จ</p>
          <button onClick={() => setOpen(true)} className="mt-3 min-h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">+ เพิ่มรางวัล</button>
        </div>
      ) : (
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80">
          {mission.reward_image_url ? (
            <div className="h-44 bg-cover bg-center sm:h-52" style={{ backgroundImage: `url(${mission.reward_image_url})` }} />
          ) : null}
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">รางวัล</p>
                <h4 className="mt-1 text-xl font-semibold text-slate-950">{mission.reward_thai_title || mission.reward_title || 'รางวัลภารกิจ'}</h4>
              </div>
              <button onClick={() => setOpen(true)} className="min-h-9 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">แก้ไขรางวัล</button>
            </div>
            <p className="text-sm leading-6 text-slate-600">{mission.reward_emotional_copy || mission.reward_description || 'ทำภารกิจนี้ให้สำเร็จ แล้วปลดล็อกช่วงเวลาที่ตั้งใจไว้ให้ตัวเอง'}</p>
            {status === 'ready_to_claim' ? (
              <button
                disabled={pending}
                onClick={() => start(async () => {
                  setError(null);
                  const fd = new FormData();
                  fd.set('innovation_id', mission.id);
                  const res = await claimInnovationRewardAction(fd);
                  if (!res.success) setError(res.message);
                })}
                className="w-full min-h-11 rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {pending ? 'กำลังบันทึก...' : 'รับรางวัลแล้ว'}
              </button>
            ) : (
              <button className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-500" disabled>
                {status === 'claimed' ? 'รับรางวัลแล้ว' : 'ทำภารกิจให้สำเร็จก่อน'}
              </button>
            )}
          </div>
        </article>
      )}
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
      <RewardFormModal
        open={open}
        levelId={mission.id}
        defaultValues={{
          title: mission.reward_title,
          imageUrl: mission.reward_image_url
        }}
        onClose={() => setOpen(false)}
        onSubmit={(fd) => start(async () => {
          setError(null);
          fd.set('innovation_id', mission.id);
          const res = await upsertInnovationRewardAction(fd);
          if (!res.success) {
            setError(res.message);
            return;
          }
          setOpen(false);
        })}
      />
    </section>
  );
}
