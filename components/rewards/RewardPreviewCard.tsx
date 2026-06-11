import Image from 'next/image';

type RewardData = {
  title: string;
  description?: string | null;
  emotionalCopy?: string | null;
  imageUrl?: string | null;
  status?: 'locked' | 'unlocked' | 'claimed' | null;
};

type Props = {
  missionTitle?: string;
  emptyTitle: string;
  emptyDescription: string;
  lockedCta: string;
  reward?: RewardData | null;
  isMissionCompleted?: boolean;
  onAddReward?: () => void;
  onDeleteReward?: () => void;
  onClaimReward?: () => void;
  isClaimingReward?: boolean;
};

export function RewardPreviewCard({
  missionTitle,
  emptyTitle,
  emptyDescription,
  lockedCta,
  reward,
  isMissionCompleted = false,
  onAddReward,
  onDeleteReward,
  onClaimReward,
  isClaimingReward = false
}: Props) {
  const hasRewardContent = Boolean(reward?.title || reward?.imageUrl);

  if (!hasRewardContent) {
    return (
      <section className="pt-2 sm:pt-3">
        <article className="reward-card rounded-3xl border border-dashed border-amber-200/35 bg-gradient-to-br from-[#2a1f12]/95 via-[#1f1710]/95 to-[#140f09]/95 p-5 shadow-[0_18px_36px_-30px_rgba(251,191,36,0.45)]">
          <p className="text-[11px] font-semibold text-amber-100/80">ภารกิจปัจจุบัน</p>
          <h3 className="mt-2 text-xl font-semibold text-amber-50">{missionTitle || 'ภารกิจปัจจุบัน'}</h3>
          <p className="mt-3 text-sm text-amber-100/85">{emptyDescription}</p>
          <p className="text-xl font-semibold text-amber-50">{emptyTitle}</p>
          <button type="button" onClick={onAddReward} className="mt-4 rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-2.5 text-sm font-medium text-amber-100 transition hover:bg-amber-300/20">+ เพิ่มรางวัล</button>
        </article>
      </section>
    );
  }

  const rewardStatus = reward?.status === 'claimed' ? 'claimed' : isMissionCompleted ? 'unlocked' : 'locked';
  const isLocked = rewardStatus === 'locked';
  const isClaimed = rewardStatus === 'claimed';

  return (
    <section className="pt-2 sm:pt-3">
      <article className="reward-card group relative overflow-hidden rounded-3xl border border-amber-300/25 bg-gradient-to-br from-[#1c1410] via-[#251912] to-[#120f0c] shadow-[0_28px_70px_-38px_rgba(251,146,60,0.65)] transition duration-500 hover:shadow-[0_32px_85px_-35px_rgba(251,146,60,0.75)]">
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.17),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-[1px] rounded-[calc(1.5rem-1px)] border border-white/10" />
        <div className="relative flex flex-col md:grid md:max-h-[380px] md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <RewardImage imageUrl={reward?.imageUrl ?? undefined} title={reward?.title ?? ''} missionTitle={missionTitle} isLocked={isLocked} />
          <div className="relative flex flex-col gap-5 p-5 sm:p-6">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${isClaimed ? 'border-emerald-300/40 bg-emerald-300/20 text-emerald-100' : isLocked ? 'border-amber-300/35 bg-amber-300/20 text-amber-100' : 'border-amber-200/45 bg-amber-300/30 text-amber-50'}`}>
                  {isClaimed ? 'รับรางวัลแล้ว' : isLocked ? 'รางวัลยังล็อกอยู่' : 'รางวัลปลดล็อกแล้ว'}
                </span>
                <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2.5">
                  <button type="button" onClick={onDeleteReward} className="min-h-9 rounded-lg border border-rose-300/20 bg-rose-400/5 px-3 py-1.5 text-xs font-medium text-rose-100/75 transition hover:border-rose-300/35 hover:bg-rose-400/15 hover:text-rose-50">ลบรางวัล</button>
                  <button type="button" onClick={onAddReward} className="min-h-9 rounded-lg border border-amber-200/20 bg-amber-300/5 px-3 py-1.5 text-xs font-medium text-amber-100/80 transition hover:border-amber-200/35 hover:bg-amber-300/15 hover:text-amber-50">แก้ไขรางวัล</button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-semibold leading-tight text-amber-50 sm:text-[1.75rem]">{reward?.title}</p>
                <p className="text-sm text-amber-100/75">{missionTitle || 'ภารกิจปัจจุบัน'}</p>
                <p className="text-sm italic leading-relaxed text-amber-100/90">
                  {reward?.emotionalCopy || reward?.description || 'ทำภารกิจนี้ให้สำเร็จ แล้วปลดล็อกช่วงเวลาที่ตั้งใจไว้ให้ตัวเอง'}
                </p>
              </div>
            </div>
            <button type="button" disabled={isLocked || isClaimed || isClaimingReward} onClick={onClaimReward} className="w-full rounded-xl border border-amber-100/40 bg-gradient-to-r from-amber-200 via-orange-200 to-amber-100 px-4 py-3 text-sm font-semibold text-[#2d1f10] shadow-[0_12px_24px_-14px_rgba(253,186,116,0.95)] disabled:cursor-not-allowed disabled:brightness-75">
              {isClaimed ? 'รับรางวัลนี้แล้ว' : isLocked ? lockedCta : isClaimingReward ? 'กำลังรับรางวัล...' : 'ยืนยันรับรางวัล'}
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}

function RewardImage({ imageUrl, title, missionTitle, isLocked }: { imageUrl?: string; title: string; missionTitle?: string; isLocked: boolean }) {
  if (!imageUrl) {
    return <div className="relative flex h-[240px] items-center justify-center border-b border-white/10 bg-[#1a120b] md:h-full md:min-h-[300px] md:border-b-0 md:border-r md:border-white/10"><p className="text-sm text-amber-100/70">ยังไม่มีรูปภาพรางวัล</p></div>;
  }

  return (
    <div className="relative h-[250px] overflow-hidden border-b border-white/10 bg-black md:h-full md:min-h-[320px] md:border-b-0 md:border-r md:border-white/10">
      <Image src={imageUrl} alt="รูปภาพรางวัลภารกิจ" fill className="object-cover object-center" sizes="(min-width: 768px) 60vw, 100vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1c1209]/55 via-[#1f140d]/15 to-transparent" />
      <span className="absolute left-4 top-4 rounded-full border border-amber-200/40 bg-amber-200/20 px-3 py-1 text-[11px] font-semibold text-amber-50">ช่วงเวลารางวัล</span>
      {isLocked ? <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-amber-100/35 bg-black/35 px-3 py-1 text-xs font-medium text-amber-50">ยังล็อกอยู่</span> : null}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="line-clamp-2 text-2xl font-semibold text-white sm:text-3xl">{title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-amber-50/90">ภารกิจสำเร็จแล้ว · {missionTitle || 'ภารกิจปัจจุบัน'}</p>
      </div>
    </div>
  );
}
