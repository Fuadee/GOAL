import Image from 'next/image';
import { CheckCircle2, Gift, Lock } from 'lucide-react';

import { BloodDonationReward } from '@/lib/blood-donation/types';

type Props = {
  missionTitle?: string;
  reward?: BloodDonationReward | null;
  isMissionCompleted?: boolean;
  onAddReward?: () => void;
  onClaimReward?: () => void;
  isClaimingReward?: boolean;
};

export function RewardPreviewCard({
  missionTitle,
  reward,
  isMissionCompleted = false,
  onAddReward,
  onClaimReward,
  isClaimingReward = false
}: Props) {
  const hasRewardContent = Boolean(reward?.title || reward?.imageUrl);

  if (!hasRewardContent) {
    return (
      <section className="space-y-3 pt-0.5">
        <article className="rounded-2xl border border-dashed border-white/20 bg-slate-900/60 p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/75">Reward Preview · Current Mission</p>
          <h3 className="mt-2 text-lg font-medium text-white">{missionTitle || 'ภารกิจปัจจุบัน'}</h3>
          <p className="mt-3 text-sm text-slate-300">ภารกิจนี้ยังไม่มีรางวัล</p>
          <button
            type="button"
            onClick={onAddReward}
            className="mt-4 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/15"
          >
            + เพิ่ม Reward
          </button>
        </article>
      </section>
    );
  }

  const displayReward = reward as BloodDonationReward;
  const rewardStatus = displayReward.status === 'claimed' ? 'claimed' : isMissionCompleted ? 'unlocked' : 'locked';
  const isLocked = rewardStatus === 'locked';
  const isClaimed = rewardStatus === 'claimed';

  return (
    <section className="space-y-3 pt-0.5">
      <article className="group relative overflow-hidden rounded-3xl border border-cyan-200/15 bg-gradient-to-br from-[#040816] via-[#0c1834] to-[#130f2f] shadow-[0_28px_60px_-40px_rgba(34,211,238,0.48)]">
        <div className="pointer-events-none absolute inset-[1px] rounded-[calc(1.5rem-1px)] border border-white/10" />
        <div className="relative">
          <RewardImage imageUrl={displayReward.imageUrl} title={displayReward.title} missionTitle={missionTitle} isLocked={isLocked} />

          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${isClaimed ? 'border-emerald-300/40 bg-emerald-400/20 text-emerald-100' : isLocked ? 'border-amber-300/40 bg-amber-400/20 text-amber-100' : 'border-cyan-300/45 bg-cyan-400/20 text-cyan-100'}`}>
                {isClaimed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Gift className="h-3.5 w-3.5" />}
                {isClaimed ? 'รับรางวัลแล้ว' : isLocked ? 'ทำภารกิจให้สำเร็จก่อน' : 'รางวัลของคุณ'}
              </span>
              <button type="button" onClick={onAddReward} className="text-xs text-cyan-100/80 hover:text-cyan-50">
                แก้ไข reward
              </button>
            </div>

            <button
              type="button"
              disabled={isLocked || isClaimed || isClaimingReward}
              onClick={onClaimReward}
              className="mt-4 w-full rounded-xl border border-cyan-300/45 bg-cyan-500/20 px-4 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isClaimed ? 'รับรางวัลแล้ว' : isLocked ? 'ปลดล็อกเมื่อภารกิจสำเร็จ' : isClaimingReward ? 'กำลังรับรางวัล...' : 'รับรางวัลเลย!'}
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}

function RewardImage({ imageUrl, title, missionTitle, isLocked }: { imageUrl?: string; title: string; missionTitle?: string; isLocked: boolean }) {
  if (!imageUrl) {
    return (
      <div className="relative flex aspect-[16/9] items-center justify-center border-b border-white/10 bg-slate-950">
        <p className="text-sm text-slate-300">ยังไม่มีรูปภาพรางวัล</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-slate-950">
      <Image
        src={imageUrl}
        alt="Mission reward image"
        fill
        className="object-cover"
        sizes="100vw"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
          const placeholder = event.currentTarget.parentElement?.querySelector<HTMLElement>('[data-placeholder]');
          if (placeholder) placeholder.style.display = 'flex';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        รางวัลของคุณ
      </span>
      {isLocked ? (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-amber-200/40 bg-amber-500/25 px-3 py-1 text-xs font-medium text-amber-100">
          <Lock className="h-3.5 w-3.5" /> ทำภารกิจให้สำเร็จก่อน
        </span>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="text-2xl font-semibold text-white sm:text-3xl">{title}</p>
        <p className="mt-1 text-sm text-slate-200">รางวัลของคุณเมื่อทำภารกิจสำเร็จ · {missionTitle || 'ภารกิจปัจจุบัน'}</p>
      </div>

      <div
        data-placeholder
        style={{ display: 'none' }}
        className="absolute inset-0 items-center justify-center bg-gradient-to-br from-orange-300/30 via-rose-400/20 to-indigo-500/25"
      >
        <div className="rounded-2xl border border-white/20 bg-black/25 px-5 py-4 text-center backdrop-blur">
          <p className="text-3xl">🍣</p>
          <p className="mt-1 text-sm font-medium text-white">Japanese Reward</p>
        </div>
      </div>
    </div>
  );
}
