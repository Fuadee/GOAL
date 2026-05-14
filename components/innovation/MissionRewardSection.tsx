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
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Mission Reward</h3>
        <p className="text-xs text-slate-500">รางวัลเมื่อภารกิจสำเร็จ</p>
      </div>
      {!hasReward ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">ตั้งรางวัลให้ภารกิจนี้ เพื่อเพิ่มแรงจูงใจในการทำให้สำเร็จ</p>
          <button onClick={() => setOpen(true)} className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700">+ Add Reward</button>
        </div>
      ) : (
        <div className="space-y-3">
          {mission.reward_image_url ? <img src={mission.reward_image_url} alt="Reward" className="h-40 w-full rounded-xl object-cover" /> : null}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-slate-900">{mission.reward_thai_title || mission.reward_title}</p>
              <p className="text-sm italic text-slate-600">{mission.reward_emotional_copy}</p>
              <p className="text-sm text-slate-500">{mission.reward_description}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{status === 'locked' ? 'Locked' : status === 'ready_to_claim' ? 'Ready' : 'Claimed'}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setOpen(true)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700">Edit Reward</button>
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
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white"
              >
                รับรางวัล
              </button>
            ) : (
              <p className="self-center text-xs text-slate-500">{status === 'claimed' ? 'รับรางวัลแล้ว' : 'ปลดล็อกเมื่อภารกิจสำเร็จ'}</p>
            )}
          </div>
        </div>
      )}
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
      <RewardFormModal
        open={open}
        levelId={mission.id}
        defaultValues={{
          title: mission.reward_title,
          thaiTitle: mission.reward_thai_title,
          description: mission.reward_description,
          emotionalCopy: mission.reward_emotional_copy,
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
