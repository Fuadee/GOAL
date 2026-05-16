import { MissionRewardCard } from '@/components/ui/mission-system';
import { BloodDonationReward } from '@/lib/blood-donation/types';

type Props = {
  missionTitle?: string;
  reward?: BloodDonationReward | null;
  isMissionCompleted?: boolean;
  onAddReward?: () => void;
  onDeleteReward?: () => void;
  onClaimReward?: () => void;
  isClaimingReward?: boolean;
};

export function RewardPreviewCard({ missionTitle, reward, isMissionCompleted = false, onAddReward, onDeleteReward, onClaimReward, isClaimingReward = false }: Props) {
  const hasRewardContent = Boolean(reward?.title || reward?.imageUrl);

  if (!hasRewardContent) {
    return <section className="pt-2 sm:pt-3"><article className="rounded-3xl border border-dashed border-amber-200/35 bg-gradient-to-br from-[#2a1f12]/95 via-[#1f1710]/95 to-[#140f09]/95 p-5"><p className="text-sm text-amber-100/85">ภารกิจนี้ยังไม่มีรางวัล ลองเพิ่มภาพ Moment ที่คุณอยากได้เมื่อทำสำเร็จ</p><button type="button" onClick={onAddReward} className="mt-4 rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-2.5 text-sm font-medium text-amber-100">+ เพิ่ม Reward</button></article></section>;
  }

  const displayReward = reward as BloodDonationReward;
  const rewardStatus = displayReward.status === 'claimed' ? 'claimed' : isMissionCompleted ? 'unlocked' : 'locked';

  return <MissionRewardCard
    accent="amber"
    missionTitle={missionTitle}
    rewardTitle={displayReward.title}
    rewardImageUrl={displayReward.imageUrl}
    emotionalCopy={displayReward.emotionalCopy}
    description={displayReward.description}
    isLocked={rewardStatus === 'locked'}
    isClaimed={rewardStatus === 'claimed'}
    actions={<div className="flex gap-2"><button type="button" onClick={onDeleteReward} className="min-h-9 rounded-lg border border-rose-300/20 bg-rose-400/5 px-3 py-1.5 text-xs font-medium text-rose-100/75">ลบ reward</button><button type="button" onClick={onAddReward} className="min-h-9 rounded-lg border border-amber-200/20 bg-amber-300/5 px-3 py-1.5 text-xs font-medium text-amber-100/80">แก้ไข reward</button></div>}
    cta={<button type="button" disabled={rewardStatus !== 'unlocked' || isClaimingReward} onClick={onClaimReward} className="w-full rounded-lg bg-black/20 px-4 py-3 text-sm font-semibold text-current disabled:opacity-70">{rewardStatus === 'claimed' ? 'รับรางวัลนี้แล้ว' : rewardStatus === 'locked' ? 'ทำภารกิจเพื่อปลดล็อก' : isClaimingReward ? 'กำลังรับรางวัล...' : 'Mark Reward Claimed'}</button>}
  />;
}
