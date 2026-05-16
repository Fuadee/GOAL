'use client';

import { useState, useTransition } from 'react';
import { RewardFormModal } from '@/components/rewards/RewardFormModal';
import { MissionRewardCard } from '@/components/ui/mission-system';
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
        <div className="rounded-3xl border border-dashed border-cyan-200/35 bg-gradient-to-br from-[#122235]/95 via-[#12202e]/95 to-[#0f1724]/95 p-5 text-center">
          <p className="text-sm text-cyan-100/85">ตั้งรางวัลให้ภารกิจนี้ เพื่อเพิ่มแรงจูงใจในการทำให้สำเร็จ</p>
          <button onClick={() => setOpen(true)} className="mt-3 rounded-lg border border-cyan-300/40 px-3 py-1.5 text-sm text-cyan-100">+ Add Reward</button>
        </div>
      ) : (
        <MissionRewardCard
          accent="cyan"
          missionTitle={mission.title}
          rewardTitle={mission.reward_thai_title || mission.reward_title || 'Mission Reward'}
          rewardImageUrl={mission.reward_image_url || undefined}
          emotionalCopy={mission.reward_emotional_copy}
          description={mission.reward_description}
          isLocked={status === 'locked'}
          isClaimed={status === 'claimed'}
          actions={<button onClick={() => setOpen(true)} className="min-h-9 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-cyan-100">Edit Reward</button>}
          cta={status === 'ready_to_claim' ? (
            <button
              disabled={pending}
              onClick={() => start(async () => {
                setError(null);
                const fd = new FormData();
                fd.set('innovation_id', mission.id);
                const res = await claimInnovationRewardAction(fd);
                if (!res.success) setError(res.message);
              })}
              className="w-full rounded-lg bg-black/25 px-3 py-2.5 text-sm font-semibold text-current"
            >
              {pending ? 'Claiming...' : 'Mark Reward Claimed'}
            </button>
          ) : (
            <button className="w-full rounded-lg bg-black/20 px-3 py-2.5 text-sm font-semibold text-current" disabled>
              {status === 'claimed' ? 'Reward Claimed' : 'Complete mission to unlock'}
            </button>
          )}
        />
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
