'use client';

import { useState, useTransition } from 'react';
import { RewardFormModal } from '@/components/rewards/RewardFormModal';
import { RewardPreviewCard } from '@/components/rewards/RewardPreviewCard';
import { claimInnovationRewardAction, upsertInnovationRewardAction } from '@/app/innovation/actions';
import type { InnovationCardViewModel } from '@/lib/innovation/types';

export function MissionRewardSection({ mission }: { mission: InnovationCardViewModel | null }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!mission) return null;
  const progressDone = mission.progressPercent >= 100;
  const hasReward = Boolean(mission.reward_title || mission.reward_image_url || mission.reward_description || mission.reward_emotional_copy);
  const rewardTitle = mission.reward_thai_title || mission.reward_title || 'รางวัลภารกิจ';

  return (
    <section>
      <RewardPreviewCard
        missionTitle={mission.title}
        emptyTitle="ภารกิจนี้ยังไม่มีรางวัล"
        emptyDescription="ตั้งรางวัลให้ภารกิจนี้ เพื่อเพิ่มแรงจูงใจในการทำให้สำเร็จ"
        lockedCta="ทำภารกิจให้สำเร็จก่อน"
        reward={hasReward ? {
          title: rewardTitle,
          description: mission.reward_description,
          emotionalCopy: mission.reward_emotional_copy,
          imageUrl: mission.reward_image_url,
          status: mission.reward_status === 'claimed' ? 'claimed' : null
        } : null}
        isMissionCompleted={progressDone}
        onAddReward={() => setOpen(true)}
        onClaimReward={() => start(async () => {
          setError(null);
          const fd = new FormData();
          fd.set('innovation_id', mission.id);
          const res = await claimInnovationRewardAction(fd);
          if (!res.success) setError(res.message);
        })}
        isClaimingReward={pending}
        improveLockedContrast
        preserveImageAspectRatio
      />
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
      <RewardFormModal
        open={open}
        levelId={mission.id}
        defaultValues={{
          title: mission.reward_title,
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
