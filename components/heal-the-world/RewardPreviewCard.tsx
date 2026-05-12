import Image from 'next/image';
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
        <article className="rounded-2xl border border-dashed border-white/15 bg-[#121c2b]/85 p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/75">Reward Preview · Current Mission</p>
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
      <article className="group relative overflow-hidden rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-[#0a1422] via-[#0f1b2c] to-[#132238] shadow-[0_18px_42px_-34px_rgba(45,212,191,0.28)]">
        <div className="pointer-events-none absolute inset-[1px] rounded-[calc(1.5rem-1px)] border border-white/10" />
        <div className="relative md:grid md:max-h-[340px] md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <RewardImage imageUrl={displayReward.imageUrl} title={displayReward.title} missionTitle={missionTitle} isLocked={isLocked} />

          <div className="flex flex-col p-4 sm:p-5 md:justify-between md:gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${isClaimed ? 'border-cyan-300/25 bg-cyan-400/12 text-cyan-100' : isLocked ? 'border-white/15 bg-slate-800/80 text-slate-200' : 'border-cyan-300/30 bg-cyan-400/15 text-cyan-100'}`}>
                <span aria-hidden="true">{isClaimed ? '✅' : '🎁'}</span>
                {isClaimed ? 'รับรางวัลแล้ว' : isLocked ? 'ทำภารกิจให้สำเร็จก่อน' : 'รางวัลของคุณ'}
              </span>
              <button type="button" onClick={onAddReward} className="text-xs text-slate-300 hover:text-slate-100">
                แก้ไข reward
              </button>
            </div>
            <button
              type="button"
              disabled={isLocked || isClaimed || isClaimingReward}
              onClick={onClaimReward}
              className="mt-4 w-full rounded-xl border border-cyan-400/25 bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 md:mt-0"
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
      <div className="relative flex h-[220px] max-h-[240px] items-center justify-center border-b border-white/10 bg-slate-950 md:h-full md:max-h-[340px] md:min-h-[280px] md:border-b-0 md:border-r">
        <p className="text-sm text-slate-300">ยังไม่มีรูปภาพรางวัล</p>
      </div>
    );
  }

  return (
    <div className="relative h-[220px] max-h-[240px] overflow-hidden border-b border-white/10 bg-slate-950 md:h-full md:max-h-[340px] md:min-h-[280px] md:border-b-0 md:border-r">
      <Image
        src={imageUrl}
        alt="Mission reward image"
        fill
        className="object-cover object-center"
        sizes="(min-width: 768px) 45vw, 100vw"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
          const placeholder = event.currentTarget.parentElement?.querySelector<HTMLElement>('[data-placeholder]');
          if (placeholder) placeholder.style.display = 'flex';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        รางวัลของคุณ
      </span>
      {isLocked ? (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs font-medium text-slate-100">
          🔒 ทำภารกิจให้สำเร็จก่อน
        </span>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="line-clamp-2 text-xl font-semibold text-white sm:text-2xl">{title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-200">รางวัลของคุณเมื่อทำภารกิจสำเร็จ · {missionTitle || 'ภารกิจปัจจุบัน'}</p>
      </div>

      <div
        data-placeholder
        style={{ display: 'none' }}
        className="absolute inset-0 items-center justify-center bg-gradient-to-br from-cyan-400/20 via-slate-500/20 to-slate-700/30"
      >
        <div className="rounded-2xl border border-white/20 bg-black/25 px-5 py-4 text-center backdrop-blur">
          <p className="text-3xl">🍣</p>
          <p className="mt-1 text-sm font-medium text-white">Japanese Reward</p>
        </div>
      </div>
    </div>
  );
}
