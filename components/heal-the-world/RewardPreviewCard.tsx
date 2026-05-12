import Image from 'next/image';

import { BloodDonationReward } from '@/lib/blood-donation/types';

type Props = {
  missionTitle?: string;
  reward?: BloodDonationReward | null;
  isMissionCompleted?: boolean;
  onAddReward?: () => void;
};

export function RewardPreviewCard({ missionTitle, reward, isMissionCompleted = false, onAddReward }: Props) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[blood-donation] render RewardPreviewCard reward value', reward);
  }
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
  const rewardStatus = displayReward.status === 'claimed' ? 'claimed' : isMissionCompleted ? 'unlocked' : displayReward.status;
  const isUnlocked = rewardStatus !== 'locked';

  return (
    <section className="space-y-3 pt-0.5">
      <article className="overflow-hidden rounded-2xl border border-white/15 bg-slate-900/70 shadow-[0_22px_52px_-40px_rgba(15,23,42,1)]">
        <div className="grid gap-0 md:grid-cols-[1fr,1.1fr]">
          <RewardImage imageUrl={displayReward.imageUrl} />

          <div className="space-y-2 p-3.5 sm:p-4">
            <div className="flex flex-wrap items-start justify-between gap-2.5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/75">Reward Preview · Current Mission</p>
                <p className="mt-1 text-xs text-cyan-100/75">ภารกิจ: {missionTitle || 'ภารกิจปัจจุบัน'}</p>
                <h3 className="mt-1 text-xl font-medium tracking-tight text-white">{displayReward.title}</h3>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                  isUnlocked
                    ? 'border-emerald-300/40 bg-emerald-500/20 text-emerald-100'
                    : 'border-amber-300/35 bg-amber-500/15 text-amber-100'
                }`}
              >
                {isUnlocked ? 'Reward Unlocked' : 'ปลดล็อกเมื่อทำสำเร็จ'}
              </span>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

function RewardImage({ imageUrl }: { imageUrl?: string }) {
  if (!imageUrl) {
    return (
      <div className="relative flex min-h-[180px] items-center justify-center border-b border-white/10 bg-slate-950 md:min-h-full md:border-b-0 md:border-r md:border-white/10">
        <p className="text-sm text-slate-300">ยังไม่มีรูปภาพรางวัล</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[180px] border-b border-white/10 bg-slate-950 md:min-h-full md:border-b-0 md:border-r md:border-white/10">
      <Image
        src={imageUrl}
        alt="Mission reward image"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 45vw"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
          const placeholder = event.currentTarget.parentElement?.querySelector<HTMLElement>('[data-placeholder]');
          if (placeholder) placeholder.style.display = 'flex';
        }}
      />
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
